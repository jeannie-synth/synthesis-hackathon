// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {LandlordsGame} from "../src/LandlordsGame.sol";
import {GameMode, SpaceType, Space, Player, Property, GameState, JailReason, ReleaseMethod} from "../src/Types.sol";

/// @dev Test harness that exposes internal state manipulation for testing
contract LandlordsGameHarness is LandlordsGame {

    function setPlayerPosition(uint256 gameId, uint256 playerIdx, uint256 position) external {
        gamePlayers[gameId][playerIdx].position = position;
    }

    function setPlayerCash(uint256 gameId, uint256 playerIdx, uint256 cash) external {
        gamePlayers[gameId][playerIdx].cash = cash;
    }

    function setPlayerJail(uint256 gameId, uint256 playerIdx, bool inJail, uint8 turnsInJail) external {
        gamePlayers[gameId][playerIdx].inJail = inJail;
        gamePlayers[gameId][playerIdx].turnsInJail = turnsInJail;
    }

    function setPlayerDividends(uint256 gameId, uint256 playerIdx, uint256 dividends, uint256 lastContrib) external {
        gamePlayers[gameId][playerIdx].dividendsReceived = dividends;
        gamePlayers[gameId][playerIdx].lastContributionRound = lastContrib;
    }

    function setPropertyOwner(uint256 gameId, uint256 position, address owner) external {
        gameProperties[gameId][position].owner = owner;
    }

    function setPropertyHouses(uint256 gameId, uint256 position, uint8 houses) external {
        gameProperties[gameId][position].houses = houses;
    }

    function setCurrentPlayer(uint256 gameId, uint256 idx) external {
        games[gameId].currentPlayerIndex = idx;
    }

    function setHasRolled(uint256 gameId, bool rolled) external {
        games[gameId].hasRolled = rolled;
    }

    function setTreasury(uint256 gameId, uint256 amount) external {
        games[gameId].treasury = amount;
    }

    function setRound(uint256 gameId, uint256 round) external {
        games[gameId].round = round;
    }

    function setLastDice(uint256 gameId, uint256 d1, uint256 d2) external {
        games[gameId].lastDice1 = d1;
        games[gameId].lastDice2 = d2;
    }

    /// @dev Expose _processLanding for direct testing
    function processLanding(uint256 gameId, uint256 playerIdx) external {
        _processLanding(gameId, playerIdx);
    }

    /// @dev Expose _handlePayment for direct testing
    function handlePayment(uint256 gameId, uint256 playerIdx, uint256 amount, address creditor) external returns (uint256) {
        return _handlePayment(gameId, playerIdx, amount, creditor);
    }

    /// @dev Expose _calculateNetWorth for testing
    function calculateNetWorth(uint256 gameId, uint256 playerIdx) external view returns (uint256) {
        return _calculateNetWorth(gameId, playerIdx);
    }
}

contract LandlordsGameTest is Test {
    LandlordsGameHarness game;
    address[] players;
    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);
    address dave = address(0x4);
    address eve = address(0x5);

    function setUp() public {
        game = new LandlordsGameHarness();
        players = new address[](5);
        players[0] = alice;
        players[1] = bob;
        players[2] = charlie;
        players[3] = dave;
        players[4] = eve;
    }

    function _createMonopolist() internal returns (uint256) {
        return game.createGame(1, GameMode.Monopolist, players, 0, 0, true);
    }

    function _createProsperity() internal returns (uint256) {
        return game.createGame(2, GameMode.Prosperity, players, 0, 0, true);
    }

    /// @dev Helper to do a full turn for the current player (roll + end)
    function _doTurn(uint256 gid, address player) internal {
        vm.prank(player);
        game.rollAndMove(gid);
        vm.prank(player);
        game.endTurn(gid);
    }

    // ======== 1. Game Creation ========

    function test_createGame_monopolist() public {
        uint256 gid = _createMonopolist();
        assertEq(gid, 1);
        assertEq(game.getPlayerCount(gid), 5);

        GameState memory s = game.getFullState(gid);
        assertEq(uint(s.mode), uint(GameMode.Monopolist));
        assertEq(s.monopolistWinThreshold, 2000);
        assertEq(s.prosperityWinThreshold, 1000);
        assertFalse(s.gameOver);

        Player memory p = game.getPlayer(gid, 0);
        assertEq(p.cash, 500);
        assertEq(p.position, 0);
    }

    function test_createGame_prosperity() public {
        uint256 gid = _createProsperity();
        GameState memory s = game.getFullState(gid);
        assertEq(uint(s.mode), uint(GameMode.Prosperity));
    }

    function test_createGame_customThresholds() public {
        uint256 gid = game.createGame(1, GameMode.Monopolist, players, 5000, 3000, true);
        GameState memory s = game.getFullState(gid);
        assertEq(s.monopolistWinThreshold, 5000);
        assertEq(s.prosperityWinThreshold, 3000);
    }

    function test_createGame_reverts_tooFewPlayers() public {
        address[] memory empty = new address[](0);
        vm.expectRevert("1-6 players");
        game.createGame(1, GameMode.Monopolist, empty, 0, 0, true);
    }

    // ======== 2. Multi-Game Independence ========

    function test_multiGame_independentState() public {
        uint256 gid1 = _createMonopolist();
        uint256 gid2 = _createProsperity();

        assertEq(gid1, 1);
        assertEq(gid2, 2);
        assertEq(game.nextGameId(), 3);

        GameState memory s1 = game.getFullState(gid1);
        GameState memory s2 = game.getFullState(gid2);
        assertEq(uint(s1.mode), uint(GameMode.Monopolist));
        assertEq(uint(s2.mode), uint(GameMode.Prosperity));
    }

    // ======== 3. Roll and Move ========

    function test_rollAndMove_basic() public {
        uint256 gid = _createMonopolist();
        vm.prank(alice);
        game.rollAndMove(gid);

        Player memory p = game.getPlayer(gid, 0);
        assertTrue(p.position >= 2 && p.position <= 12); // 2d6 range

        GameState memory s = game.getFullState(gid);
        assertTrue(s.lastDice1 >= 1 && s.lastDice1 <= 6);
        assertTrue(s.lastDice2 >= 1 && s.lastDice2 <= 6);
        assertEq(s.turnsTaken, 1);
    }

    function test_rollAndMove_wrongPlayer_reverts() public {
        uint256 gid = _createMonopolist();
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.NotYourTurn.selector));
        game.rollAndMove(gid);
    }

    function test_rollAndMove_doubleRoll_reverts() public {
        uint256 gid = _createMonopolist();
        vm.prank(alice);
        game.rollAndMove(gid);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.AlreadyRolled.selector));
        game.rollAndMove(gid);
    }

    // ======== 4. End Turn ========

    function test_endTurn_advancesPlayer() public {
        uint256 gid = _createMonopolist();
        _doTurn(gid, alice);

        GameState memory s = game.getFullState(gid);
        assertEq(s.currentPlayerIndex, 1);
    }

    function test_endTurn_roundIncrementsOnWrap() public {
        uint256 gid = _createMonopolist();
        for (uint256 i = 0; i < 5; i++) {
            _doTurn(gid, players[i]);
        }

        GameState memory s = game.getFullState(gid);
        assertEq(s.currentPlayerIndex, 0);
        assertEq(s.round, 1);
    }

    // ======== 5. Board Spaces ========

    function test_board_secondUtility() public {
        Space memory s = game.getSpace(22);
        assertEq(uint(s.spaceType), uint(SpaceType.Utility));
        assertEq(s.price, 150);
    }

    function test_board_windfall() public {
        Space memory s = game.getSpace(14);
        assertEq(uint(s.spaceType), uint(SpaceType.Windfall));
        assertEq(s.price, 50);
    }

    function test_board_expense() public {
        Space memory s = game.getSpace(7);
        assertEq(uint(s.spaceType), uint(SpaceType.Expense));
        assertEq(s.price, 50);
    }

    // ======== 6. Buy Property ========

    function test_buyProperty_monopolist() public {
        uint256 gid = _createMonopolist();

        // Force alice to pos 1 (Poverty Place, $60) and simulate having rolled
        game.setPlayerPosition(gid, 0, 1);
        game.setHasRolled(gid, true);

        vm.prank(alice);
        game.buyProperty(gid);

        Property memory prop = game.getProperty(gid, 1);
        assertEq(prop.owner, alice);

        Player memory p = game.getPlayer(gid, 0);
        assertEq(p.cash, 440);
    }

    function test_buyProperty_prosperity_goesToTreasury() public {
        uint256 gid = _createProsperity();

        game.setPlayerPosition(gid, 0, 1);
        game.setHasRolled(gid, true);

        vm.prank(alice);
        game.buyProperty(gid);

        GameState memory s = game.getFullState(gid);
        assertEq(s.treasury, 60);
    }

    function test_buyProperty_cantBuyBluebloodInProsperity() public {
        uint256 gid = _createProsperity();

        game.setPlayerPosition(gid, 0, 17);
        game.setHasRolled(gid, true);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.CantBuyInProsperityPark.selector));
        game.buyProperty(gid);
    }

    // ======== 7. Build House ========

    function test_buildHouse() public {
        uint256 gid = _createMonopolist();

        game.setPropertyOwner(gid, 1, alice);
        game.setHasRolled(gid, true);

        vm.prank(alice);
        game.buildHouse(gid, 1);

        Property memory prop = game.getProperty(gid, 1);
        assertEq(prop.houses, 1);
        assertEq(game.getPlayer(gid, 0).cash, 450); // 500 - 50
    }

    function test_buildHouse_maxHouses_reverts() public {
        uint256 gid = _createMonopolist();

        game.setPropertyOwner(gid, 1, alice);
        game.setPropertyHouses(gid, 1, 4);
        game.setHasRolled(gid, true);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.MaxHousesReached.selector));
        game.buildHouse(gid, 1);
    }

    // ======== 8. Rent — Monopolist ========

    function test_rent_monopolist_paysOwner() public {
        uint256 gid = _createMonopolist();

        game.setPropertyOwner(gid, 1, alice);
        game.setPlayerPosition(gid, 1, 1); // Bob on pos 1
        game.setCurrentPlayer(gid, 1);
        game.setLastDice(gid, 3, 4); // For utility rent calc

        game.processLanding(gid, 1);

        // Rent = 60/10 = $6
        assertEq(game.getPlayer(gid, 1).cash, 494);
        assertEq(game.getPlayer(gid, 0).cash, 506);
    }

    // ======== 9. Rent — Prosperity (to treasury) ========

    function test_rent_prosperity_goesToTreasury() public {
        uint256 gid = _createProsperity();

        game.setPropertyOwner(gid, 1, alice);
        game.setPlayerPosition(gid, 1, 1);
        game.setCurrentPlayer(gid, 1);

        game.processLanding(gid, 1);

        GameState memory s = game.getFullState(gid);
        assertEq(s.treasury, 6);
        assertEq(game.getPlayer(gid, 0).cash, 500); // Owner gets nothing
    }

    // ======== 10. Jail — Monopolist ========

    function test_jail_monopolist_goToJail() public {
        uint256 gid = _createMonopolist();

        game.setPlayerPosition(gid, 0, 30); // GoToJail
        game.processLanding(gid, 0);

        Player memory p = game.getPlayer(gid, 0);
        assertTrue(p.inJail);
        assertEq(p.position, 10);
    }

    function test_jail_monopolist_buyout() public {
        uint256 gid = _createMonopolist();

        game.setPlayerJail(gid, 0, true, 0);
        game.setPlayerPosition(gid, 0, 10);

        // Buyout at turn 0: 50 * (3 - 0) = $150
        vm.prank(alice);
        game.payJailBuyout(gid);

        Player memory p = game.getPlayer(gid, 0);
        assertFalse(p.inJail);
        assertEq(p.cash, 350);
    }

    function test_jail_monopolist_buyout_decreases() public {
        uint256 gid = _createMonopolist();

        // After 1 turn in jail: buyout = 50 * (3 - 1) = $100
        game.setPlayerJail(gid, 0, true, 1);
        game.setPlayerPosition(gid, 0, 10);

        vm.prank(alice);
        game.payJailBuyout(gid);

        assertEq(game.getPlayer(gid, 0).cash, 400); // 500 - 100
    }

    function test_jail_monopolist_wait3Turns() public {
        uint256 gid = _createMonopolist();

        game.setPlayerJail(gid, 0, true, 0);
        game.setPlayerPosition(gid, 0, 10);

        // Wait 3 turns
        for (uint8 i = 0; i < 3; i++) {
            // Set alice as current player for each jail wait
            game.setCurrentPlayer(gid, 0);
            vm.prank(alice);
            game.waitInJail(gid);

            if (i < 2) {
                assertTrue(game.getPlayer(gid, 0).inJail);
            }
        }

        assertFalse(game.getPlayer(gid, 0).inJail);
    }

    // ======== 11. Jail — Prosperity (No Jail Unless Free Rider) ========

    function test_jail_prosperity_noJailIfInnocent() public {
        uint256 gid = _createProsperity();

        game.setPlayerPosition(gid, 0, 30);
        game.processLanding(gid, 0);

        assertFalse(game.getPlayer(gid, 0).inJail);
    }

    function test_jail_prosperity_jailsCommonsExploiter() public {
        uint256 gid = _createProsperity();

        // Alice received dividends but never contributed, and enough rounds have passed
        game.setPlayerDividends(gid, 0, 3, 0); // 3 dividends, last contribution at round 0
        game.setRound(gid, 10); // Current round >> lastContribution + playerCount(5)
        game.setPlayerPosition(gid, 0, 30);

        game.processLanding(gid, 0);

        assertTrue(game.getPlayer(gid, 0).inJail);
    }

    function test_jail_prosperity_noBuyout() public {
        uint256 gid = _createProsperity();

        game.setPlayerJail(gid, 0, true, 0);
        game.setPlayerPosition(gid, 0, 10);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.NoBuyoutInProsperity.selector));
        game.payJailBuyout(gid);
    }

    // ======== 12. Mode Switch ========

    function test_modeSwitch_passes() public {
        uint256 gid = _createMonopolist();

        vm.prank(alice);
        game.proposeModeSwitch(gid);

        vm.prank(bob);
        game.voteModeSwitch(gid, true);
        vm.prank(charlie);
        game.voteModeSwitch(gid, true);
        vm.prank(dave);
        game.voteModeSwitch(gid, true);
        vm.prank(eve);
        game.voteModeSwitch(gid, true);

        GameState memory s = game.getFullState(gid);
        assertEq(uint(s.mode), uint(GameMode.Prosperity));
        assertEq(s.modeSwitchCount, 1);
    }

    function test_modeSwitch_rejected_endsTurn() public {
        uint256 gid = _createMonopolist();

        vm.prank(alice);
        game.proposeModeSwitch(gid);

        vm.prank(bob);
        game.voteModeSwitch(gid, false);
        vm.prank(charlie);
        game.voteModeSwitch(gid, false);
        vm.prank(dave);
        game.voteModeSwitch(gid, false);
        vm.prank(eve);
        game.voteModeSwitch(gid, true);

        GameState memory s = game.getFullState(gid);
        assertEq(uint(s.mode), uint(GameMode.Monopolist));
        assertEq(s.currentPlayerIndex, 1); // Turn skipped to bob
    }

    function test_modeSwitch_proposerCantVote() public {
        uint256 gid = _createMonopolist();

        vm.prank(alice);
        game.proposeModeSwitch(gid);

        vm.prank(alice);
        vm.expectRevert("Proposer cannot vote");
        game.voteModeSwitch(gid, true);
    }

    function test_modeSwitch_cantProposeAfterRoll() public {
        uint256 gid = _createMonopolist();

        vm.prank(alice);
        game.rollAndMove(gid);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.AlreadyRolled.selector));
        game.proposeModeSwitch(gid);
    }

    // ======== 13. Treasury & Dividends ========

    function test_treasury_dividendDistribution() public {
        uint256 gid = _createProsperity();

        // Set treasury to 500 (threshold)
        game.setTreasury(gid, 500);

        // Force alice to land on tax (pos 4, $50) to trigger treasury contribution + dividend check
        game.setPlayerPosition(gid, 0, 4);
        game.processLanding(gid, 0);

        // Treasury was 500, tax adds (up to) 50 → 550, then distributed: 550/5 = 110 each
        // Alice: 500 - 50 + 110 = 560
        // Others: 500 + 110 = 610
        GameState memory s = game.getFullState(gid);
        assertEq(s.treasury, 0);
        assertEq(game.getPlayer(gid, 0).cash, 560);
        assertEq(game.getPlayer(gid, 1).cash, 610);
    }

    // ======== 14. Liquidation ========

    function test_liquidation_sellsPropertyToPayDebt() public {
        uint256 gid = _createMonopolist();

        // Alice has $5 cash, owns Lonely Lane (pos 6, $100)
        game.setPlayerCash(gid, 0, 5);
        game.setPropertyOwner(gid, 6, alice);

        // Bob owns Boomtown (pos 8, rent = 100/10 = $10)
        game.setPropertyOwner(gid, 8, bob);

        game.setPlayerPosition(gid, 0, 8);
        game.setCurrentPlayer(gid, 0);
        game.processLanding(gid, 0);

        // Alice had $5, owed $10. Cash goes to 0, debt = $5.
        // Liquidates pos 6 ($100): pays remaining $5 debt, keeps $95 change.
        Player memory p = game.getPlayer(gid, 0);
        assertEq(p.cash, 95);
        assertFalse(p.inJail);

        // Property is now unowned
        Property memory prop = game.getProperty(gid, 6);
        assertEq(prop.owner, address(0));
    }

    function test_liquidation_cantPay_goesToJail() public {
        uint256 gid = _createMonopolist();

        game.setPlayerCash(gid, 0, 0);
        // No properties to liquidate

        game.setPropertyOwner(gid, 8, bob); // Bob owns Boomtown
        game.setPlayerPosition(gid, 0, 8);
        game.setCurrentPlayer(gid, 0);
        game.processLanding(gid, 0);

        Player memory p = game.getPlayer(gid, 0);
        assertTrue(p.inJail);
        assertEq(p.position, 10);
    }

    // ======== 15. Net Worth ========

    function test_netWorth_cashOnly() public {
        uint256 gid = _createMonopolist();
        assertEq(game.calculateNetWorth(gid, 0), 500);
    }

    function test_netWorth_withProperties() public {
        uint256 gid = _createMonopolist();

        game.setPropertyOwner(gid, 1, alice);  // $60
        game.setPropertyOwner(gid, 6, alice);  // $100
        game.setPropertyHouses(gid, 6, 2);     // 2 * $50 = $100

        // Net worth = 500 (cash) + 60 + 100 + 100 (houses) = 760
        assertEq(game.calculateNetWorth(gid, 0), 760);
    }

    // ======== 16. Win Conditions ========

    function test_win_monopolist_netWorth() public {
        uint256 gid = _createMonopolist();

        // Give alice enough to win: $1500 cash + Prosperity Place ($400) + The Estates ($300) = $2200
        game.setPlayerCash(gid, 0, 1500);
        game.setPropertyOwner(gid, 39, alice);
        game.setPropertyOwner(gid, 37, alice);

        game.setHasRolled(gid, true);
        vm.prank(alice);
        game.endTurn(gid);

        GameState memory s = game.getFullState(gid);
        assertTrue(s.gameOver);
        assertEq(s.winner, alice);
    }

    function test_win_prosperity_poorestReaches() public {
        uint256 gid = _createProsperity();

        for (uint256 i = 0; i < 5; i++) {
            game.setPlayerCash(gid, i, 1000);
        }

        game.setHasRolled(gid, true);
        vm.prank(alice);
        game.endTurn(gid);

        assertTrue(game.getFullState(gid).gameOver);
    }

    function test_noWin_ifPoorestBelowThreshold() public {
        uint256 gid = _createProsperity();

        for (uint256 i = 0; i < 4; i++) {
            game.setPlayerCash(gid, i, 2000);
        }
        game.setPlayerCash(gid, 4, 100); // Eve is poor

        game.setHasRolled(gid, true);
        vm.prank(alice);
        game.endTurn(gid);

        assertFalse(game.getFullState(gid).gameOver);
    }

    // ======== 17. Join Game ========

    function test_joinGame() public {
        address[] memory initial = new address[](2);
        initial[0] = alice;
        initial[1] = bob;
        uint256 gid = game.createGame(1, GameMode.Monopolist, initial, 0, 0, true);

        vm.prank(charlie);
        game.joinGame(gid);

        assertEq(game.getPlayerCount(gid), 3);
        assertEq(game.getPlayer(gid, 2).addr, charlie);
    }

    function test_joinGame_reverts_afterStarted() public {
        uint256 gid = _createMonopolist();

        vm.prank(alice);
        game.rollAndMove(gid);

        vm.prank(address(0x99));
        vm.expectRevert(abi.encodeWithSelector(LandlordsGame.GameAlreadyStarted.selector));
        game.joinGame(gid);
    }

    // ======== 18. getFullState ========

    function test_getFullState() public {
        uint256 gid = _createMonopolist();

        GameState memory s = game.getFullState(gid);
        assertEq(s.gameId, gid);
        assertEq(s.players.length, 5);
        assertEq(s.players[0].addr, alice);
        assertEq(s.players[0].cash, 500);
        assertEq(s.properties[0].owner, address(0));
    }

    // ======== 19. Windfall & Expense Spaces ========

    function test_windfall_collectsBonus() public {
        uint256 gid = _createMonopolist();

        game.setPlayerPosition(gid, 0, 14); // Community Bounty (Windfall, $50)
        game.processLanding(gid, 0);

        assertEq(game.getPlayer(gid, 0).cash, 550); // 500 + 50
    }

    function test_expense_monopolist_paysToBank() public {
        uint256 gid = _createMonopolist();

        game.setPlayerPosition(gid, 0, 7); // Family Emergency (Expense, $50)
        game.processLanding(gid, 0);

        assertEq(game.getPlayer(gid, 0).cash, 450); // 500 - 50
        assertEq(game.getFullState(gid).treasury, 0); // Monopolist: goes to bank, not treasury
    }

    function test_expense_prosperity_paysToTreasury() public {
        uint256 gid = _createProsperity();

        game.setPlayerPosition(gid, 0, 7); // Family Emergency (Expense, $50)
        game.processLanding(gid, 0);

        assertEq(game.getPlayer(gid, 0).cash, 450);
        assertEq(game.getFullState(gid).treasury, 50); // Prosperity: goes to treasury
    }

    // ======== 20. Lord Blueblood's Estate — Mode-Conditional ========

    function test_blueblood_noRentInProsperity() public {
        uint256 gid = _createProsperity();

        // Alice owns pos 17 in prosperity mode
        game.setPropertyOwner(gid, 17, alice);

        // Bob lands on pos 17
        game.setPlayerPosition(gid, 1, 17);
        game.setCurrentPlayer(gid, 1);
        game.processLanding(gid, 1);

        // No rent charged — it's a public park
        assertEq(game.getPlayer(gid, 1).cash, 500);
        assertEq(game.getPlayer(gid, 0).cash, 500);
    }
}
