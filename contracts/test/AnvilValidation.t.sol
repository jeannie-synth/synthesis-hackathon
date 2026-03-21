// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {LandlordsGame} from "../src/LandlordsGame.sol";
import {GameMode, Player, GameState} from "../src/Types.sol";

/// @title Anvil validation for Day 8 contract changes
/// @notice Tests: 1-player create, joinGame + PlayerJoined, GameStarted on first roll,
///         findOpenGame, vote deadline auto-expiry, and full game completion
contract AnvilValidation is Test {
    LandlordsGame game;

    address agent0 = address(0xA0);
    address agent1 = address(0xA1);
    address agent2 = address(0xA2);
    address agent3 = address(0xA3);
    address agent4 = address(0xA4);

    function setUp() public {
        game = new LandlordsGame();
    }

    // ===== Test 1: Create game with 1 player =====
    function test_createGame_singlePlayer() public {
        address[] memory players = new address[](1);
        players[0] = agent0;
        uint256 gid = game.createGame(500, GameMode.Monopolist, players, 0, 0, true);
        assertEq(gid, 1);
        GameState memory s = game.getFullState(gid);
        assertEq(s.players.length, 1);
        assertEq(s.players[0].addr, agent0);
    }

    // ===== Test 2: joinGame emits PlayerJoined =====
    function test_joinGame_emitsPlayerJoined() public {
        // Create 1-player game
        address[] memory players = new address[](1);
        players[0] = agent0;
        uint256 gid = game.createGame(500, GameMode.Monopolist, players, 0, 0, true);

        // Agent1 joins — expect PlayerJoined event
        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit LandlordsGame.PlayerJoined(gid, agent1, 2);
        game.joinGame(gid);

        // Agent2 joins
        vm.prank(agent2);
        vm.expectEmit(true, false, false, true);
        emit LandlordsGame.PlayerJoined(gid, agent2, 3);
        game.joinGame(gid);

        // Verify player count
        GameState memory s = game.getFullState(gid);
        assertEq(s.players.length, 3);
    }

    // ===== Test 3: rollAndMove requires 2+ players =====
    function test_rollAndMove_needsTwoPlayers() public {
        address[] memory players = new address[](1);
        players[0] = agent0;
        uint256 gid = game.createGame(500, GameMode.Monopolist, players, 0, 0, false);

        vm.prank(agent0);
        vm.expectRevert("Need 2+ players");
        game.rollAndMove(gid);
    }

    // ===== Test 4: First rollAndMove emits GameStarted =====
    function test_firstRoll_emitsGameStarted() public {
        address[] memory players = new address[](2);
        players[0] = agent0;
        players[1] = agent1;
        uint256 gid = game.createGame(500, GameMode.Monopolist, players, 0, 0, false);

        vm.prank(agent0);
        // We expect GameStarted to be emitted
        vm.expectEmit(true, false, false, true);
        emit LandlordsGame.GameStarted(gid, 2, players);
        game.rollAndMove(gid);
    }

    // ===== Test 5: findOpenGame returns correct game =====
    function test_findOpenGame() public {
        // No games yet
        (, , , bool found) = game.findOpenGame();
        assertFalse(found);

        // Create a 1-player game
        address[] memory players = new address[](1);
        players[0] = agent0;
        uint256 gid = game.createGame(500, GameMode.Monopolist, players, 0, 0, true);

        // Should find it
        (uint256 foundId, uint256 pCount, GameMode mode, bool found2) = game.findOpenGame();
        assertTrue(found2);
        assertEq(foundId, gid);
        assertEq(pCount, 1);
        assertEq(uint256(mode), uint256(GameMode.Monopolist));
    }

    // ===== Test 6: Vote deadline auto-expiry =====
    function test_voteDeadline_autoExpiry() public {
        address[] memory players = new address[](3);
        players[0] = agent0;
        players[1] = agent1;
        players[2] = agent2;
        uint256 gid = game.createGame(500, GameMode.Monopolist, players, 0, 0, true);

        // Agent0 proposes mode switch
        vm.prank(agent0);
        game.proposeModeSwitch(gid);

        // Verify proposal is active
        GameState memory s = game.getFullState(gid);
        assertTrue(s.modeSwitchProposed);

        // Fast forward past deadline
        vm.roll(block.number + 101);

        // Agent0 tries to roll — auto-expiry should clear the proposal first
        vm.prank(agent0);
        vm.expectEmit(true, false, false, true);
        emit LandlordsGame.ModeSwitchExpired(gid, agent0, 0);
        game.rollAndMove(gid);

        // Proposal should be cleared
        s = game.getFullState(gid);
        assertFalse(s.modeSwitchProposed);
    }

    // ===== Test 7: VOTE_DEADLINE_BLOCKS constant =====
    function test_voteDeadlineConstant() public view {
        assertEq(game.VOTE_DEADLINE_BLOCKS(), 100);
    }

    // ===== Test 8: Full game with join flow (create 1 → join 4 → play to completion) =====
    function test_fullGame_createAndJoin() public {
        // Agent0 creates with just itself
        address[] memory solo = new address[](1);
        solo[0] = agent0;
        uint256 gid = game.createGame(500, GameMode.Monopolist, solo, 800, 0, false);

        // Agents 1-4 join
        vm.prank(agent1);
        game.joinGame(gid);
        vm.prank(agent2);
        game.joinGame(gid);
        vm.prank(agent3);
        game.joinGame(gid);
        vm.prank(agent4);
        game.joinGame(gid);

        // Verify 5 players
        GameState memory s = game.getFullState(gid);
        assertEq(s.players.length, 5);

        // Play turns until game ends (low threshold = 800 for faster completion)
        address[5] memory agents = [agent0, agent1, agent2, agent3, agent4];
        uint256 maxTurns = 500;

        for (uint256 t = 0; t < maxTurns; t++) {
            s = game.getFullState(gid);
            if (s.gameOver) break;

            address current = s.players[s.currentPlayerIndex].addr;

            // Handle jail
            if (s.players[s.currentPlayerIndex].inJail) {
                vm.prank(current);
                game.waitInJail(gid);
                continue;
            }

            // Roll
            if (!s.hasRolled) {
                vm.prank(current);
                game.rollAndMove(gid);
            }

            // Re-read state after roll
            s = game.getFullState(gid);
            if (s.gameOver) break;

            // Try to buy property if landed on one
            uint256 pos = s.players[s.currentPlayerIndex].position;
            if (s.properties[pos].owner == address(0) &&
                s.players[s.currentPlayerIndex].cash >= 60) {
                // Try buy — may revert if not a property space, that's OK
                vm.prank(current);
                try game.buyProperty(gid) {} catch {}
            }

            // End turn
            vm.prank(current);
            game.endTurn(gid);
        }

        s = game.getFullState(gid);
        assertTrue(s.gameOver, "Game should have ended");
        assertTrue(s.winner != address(0), "Should have a winner");
        emit log_named_address("Winner", s.winner);
        emit log_named_uint("Rounds", s.round);
        emit log_named_uint("TurnsTaken", s.turnsTaken);
    }

    // ===== Test 9: findOpenGame ignores started games =====
    function test_findOpenGame_ignoresStartedGames() public {
        // Create and start a 2-player game
        address[] memory players = new address[](2);
        players[0] = agent0;
        players[1] = agent1;
        uint256 gid1 = game.createGame(500, GameMode.Monopolist, players, 0, 0, false);

        // Start the game (first roll)
        vm.prank(agent0);
        game.rollAndMove(gid1);

        // findOpenGame should NOT return gid1
        (, , , bool found) = game.findOpenGame();
        assertFalse(found);

        // Create another game that's open
        address[] memory solo = new address[](1);
        solo[0] = agent2;
        uint256 gid2 = game.createGame(500, GameMode.Prosperity, solo, 0, 0, true);

        // Now findOpenGame should return gid2
        (uint256 foundId, , , bool found2) = game.findOpenGame();
        assertTrue(found2);
        assertEq(foundId, gid2);
    }
}