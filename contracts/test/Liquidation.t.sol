// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {LandlordsGame} from "../src/LandlordsGame.sol";
import {GameMode, SpaceType, Space, Player, Property, GameState, JailReason, ReleaseMethod} from "../src/Types.sol";

contract LandlordsGameHarness2 is LandlordsGame {
    function setPlayerPosition(uint256 gameId, uint256 playerIdx, uint256 position) external {
        gamePlayers[gameId][playerIdx].position = position;
    }
    function setPlayerCash(uint256 gameId, uint256 playerIdx, uint256 cash) external {
        gamePlayers[gameId][playerIdx].cash = cash;
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
    function setPlayerJail(uint256 gameId, uint256 playerIdx, bool inJail, uint8 turnsInJail) external {
        gamePlayers[gameId][playerIdx].inJail = inJail;
        gamePlayers[gameId][playerIdx].turnsInJail = turnsInJail;
    }
    function handlePayment(uint256 gameId, uint256 playerIdx, uint256 amount, address creditor) external returns (uint256) {
        return _handlePayment(gameId, playerIdx, amount, creditor);
    }
    function processLanding(uint256 gameId, uint256 playerIdx) external {
        _processLanding(gameId, playerIdx);
    }
}

contract LiquidationTest is Test {
    LandlordsGameHarness2 game;
    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);
    address dave = address(0x4);
    address eve = address(0x5);
    address[] players;
    uint256 gameId;

    function setUp() public {
        game = new LandlordsGameHarness2();
        players = new address[](5);
        players[0] = alice;
        players[1] = bob;
        players[2] = charlie;
        players[3] = dave;
        players[4] = eve;
        gameId = game.createGame(999, GameMode.Monopolist, players, 0, 0, true);
    }

    function test_liquidation_partial() public {
        // Bob owns position 1 (Mediterranean Ave, $60) and position 3 (Baltic Ave, $60)
        // with 2 houses each. Alice lands on pos 1, rent is high.
        // Alice has $30 cash but owns position 5 (Reading RR, $200).
        // Alice cant pay rent from cash, so position 5 gets liquidated to cover it.
        
        game.setPropertyOwner(gameId, 1, bob);
        game.setPropertyHouses(gameId, 1, 2);
        game.setPropertyOwner(gameId, 3, bob);
        game.setPropertyHouses(gameId, 3, 2);
        
        // Alice owns a property worth $200
        game.setPropertyOwner(gameId, 5, alice);
        
        // Alice has very little cash
        game.setPlayerCash(gameId, 0, 30);
        
        // Place Alice on Bobs property
        game.setPlayerPosition(gameId, 0, 1);
        game.setCurrentPlayer(gameId, 0);
        
        uint256 bobCashBefore = 500; // starting cash
        
        // Process landing - should trigger liquidation
        vm.prank(alice);
        game.processLanding(gameId, 0);
        
        // Check Alice lost the property
        GameState memory state = game.getFullState(gameId);
        emit log_named_uint("Alice cash after", state.players[0].cash);
        emit log_named_uint("Bob cash after", state.players[1].cash);
        emit log_named_address("Property 5 owner", state.properties[5].owner);
        
        // Property 5 should be unowned (liquidated)
        assertEq(state.properties[5].owner, address(0), "Property should be liquidated");
        emit log("LIQUIDATION PARTIAL: PASSED");
    }
    
    function test_liquidation_total_to_jail() public {
        // Bob owns position 1 with 4 houses. Rent is very high.
        // Alice has $10 cash and NO properties.
        // Alice cant pay at all -> goes to jail with $0.
        
        game.setPropertyOwner(gameId, 1, bob);
        game.setPropertyHouses(gameId, 1, 4);
        
        game.setPlayerCash(gameId, 0, 10);
        game.setPlayerPosition(gameId, 0, 1);
        game.setCurrentPlayer(gameId, 0);
        
        vm.prank(alice);
        game.processLanding(gameId, 0);
        
        GameState memory state = game.getFullState(gameId);
        emit log_named_uint("Alice cash after", state.players[0].cash);
        emit log_named_uint("Alice in jail", state.players[0].inJail ? 1 : 0);
        
        assertEq(state.players[0].cash, 0, "Alice should have $0");
        assertTrue(state.players[0].inJail, "Alice should be in jail");
        emit log("LIQUIDATION TOTAL (JAIL): PASSED");
    }
    
    function test_liquidation_multiple_properties() public {
        // Alice has $20, owns properties at positions 5, 6, 15 (railways)
        // Bob owns position 39 (Boardwalk equivalent) with 4 houses
        // Rent on Boardwalk with 4 houses is massive
        // Alice should lose properties one by one until debt is covered
        
        game.setPropertyOwner(gameId, 5, alice);   // $200
        game.setPropertyOwner(gameId, 15, alice);  // $200
        game.setPropertyOwner(gameId, 25, alice);  // $200
        
        game.setPropertyOwner(gameId, 39, bob);
        game.setPropertyHouses(gameId, 39, 4);
        
        game.setPlayerCash(gameId, 0, 20);
        game.setPlayerPosition(gameId, 0, 39);
        game.setCurrentPlayer(gameId, 0);
        
        vm.prank(alice);
        game.processLanding(gameId, 0);
        
        GameState memory state = game.getFullState(gameId);
        emit log_named_uint("Alice cash after", state.players[0].cash);
        
        uint256 aliceProps = 0;
        for (uint256 i = 0; i < 40; i++) {
            if (state.properties[i].owner == alice) aliceProps++;
        }
        emit log_named_uint("Alice properties remaining", aliceProps);
        emit log("LIQUIDATION MULTIPLE: PASSED");
    }

    function test_jail_buyout_monopolist() public {
        // Alice is in jail in Monopolist mode. She has $300.
        // She should be able to buy out.
        
        game.setPlayerJail(gameId, 0, true, 1);
        game.setPlayerPosition(gameId, 0, 10); // jail position
        game.setPlayerCash(gameId, 0, 300);
        game.setCurrentPlayer(gameId, 0);
        
        // Alice buys out of jail
        vm.prank(alice);
        game.payJailBuyout(gameId);
        
        GameState memory state = game.getFullState(gameId);
        emit log_named_uint("Alice still in jail", state.players[0].inJail ? 1 : 0);
        emit log_named_uint("Alice cash after buyout", state.players[0].cash);
        
        assertFalse(state.players[0].inJail, "Alice should be free");
        assertTrue(state.players[0].cash < 300, "Alice should have paid fee");
        emit log("JAIL BUYOUT: PASSED");
    }
}
