// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Space, SpaceType} from "./Types.sol";

/// @title Board — 40-space layout based on The Landlord's Game (1903)
/// @notice Provides board initialization. Static layout shared across all games.
library Board {
    uint8 constant BOARD_SIZE = 40;

    /// @notice Initialize all 40 spaces into the storage mapping
    function initSpaces(mapping(uint256 => Space) storage spaces) internal {
        // === Row 1: Mother Earth (GO) to Jail ===
        spaces[0]  = Space("Mother Earth",           SpaceType.Go,             0,   0);
        spaces[1]  = Space("Poverty Place",           SpaceType.Lot,           60,   1);
        spaces[2]  = Space("Community Chest",          SpaceType.CommunityChest, 0,  0);
        spaces[3]  = Space("Easy Street",              SpaceType.Lot,           60,   1);
        spaces[4]  = Space("Absolute Necessity",       SpaceType.Tax,           50,   0);
        spaces[5]  = Space("Soakum Lighting Co.",      SpaceType.Utility,      150,   0);
        spaces[6]  = Space("Lonely Lane",              SpaceType.Lot,          100,   2);
        spaces[7]  = Space("Family Emergency",         SpaceType.Expense,       50,   0); // Was Chance
        spaces[8]  = Space("Boomtown",                 SpaceType.Lot,          100,   2);
        spaces[9]  = Space("Slambang Trolley",         SpaceType.Railroad,     200,   0);
        spaces[10] = Space("Jail",                     SpaceType.Jail,           0,   0);

        // === Row 2: Beggarman's Court to Public Park ===
        spaces[11] = Space("Beggarman's Court",        SpaceType.Lot,          120,   3);
        spaces[12] = Space("Rubeville",                SpaceType.Lot,          120,   3);
        spaces[13] = Space("The Bowery",               SpaceType.Lot,          140,   4);
        spaces[14] = Space("Community Bounty",         SpaceType.Windfall,      50,   0); // Was Community Chest "Legacy"
        spaces[15] = Space("Rickety Row",              SpaceType.Lot,          140,   4);
        spaces[16] = Space("Grand Boulevard Railroad", SpaceType.Railroad,     200,   0);
        spaces[17] = Space("Lord Blueblood's Estate",  SpaceType.Lot,          160,   5); // Prosperity: acts as FreeParking
        spaces[18] = Space("Chance",                   SpaceType.Chance,         0,   0);
        spaces[19] = Space("Crooked Lane",             SpaceType.Lot,          160,   5);
        spaces[20] = Space("Public Park",              SpaceType.FreeParking,    0,   0);

        // === Row 3: La Swelle Hotel to Go to Jail ===
        spaces[21] = Space("La Swelle Hotel",          SpaceType.Lot,          180,   6);
        spaces[22] = Space("Aqua Pura Water Co.",      SpaceType.Utility,      150,   0); // Was Community Chest
        spaces[23] = Space("Gambling Den",             SpaceType.Lot,          180,   6);
        spaces[24] = Space("Broken Leg Railroad",      SpaceType.Railroad,     200,   0);
        spaces[25] = Space("Calamity Avenue",          SpaceType.Lot,          200,   7);
        spaces[26] = Space("Chance",                   SpaceType.Chance,         0,   0);
        spaces[27] = Space("Easy Money",               SpaceType.Lot,          220,   7);
        spaces[28] = Space("Luxury Tax",               SpaceType.Tax,           75,   0);
        spaces[29] = Space("Wall Street",              SpaceType.Lot,          220,   7);
        spaces[30] = Space("Go to Jail",               SpaceType.GoToJail,       0,   0);

        // === Row 4: Fairhope to Prosperity Place ===
        spaces[31] = Space("Fairhope Avenue",          SpaceType.Lot,          240,   8);
        spaces[32] = Space("Arden Avenue",             SpaceType.Lot,          240,   8);
        spaces[33] = Space("Community Chest",          SpaceType.CommunityChest, 0,  0);
        spaces[34] = Space("Franceswayland Avenue",    SpaceType.Lot,          260,   8);
        spaces[35] = Space("Coxeyville Short Line",    SpaceType.Railroad,     200,   0);
        spaces[36] = Space("Chance",                   SpaceType.Chance,         0,   0);
        spaces[37] = Space("The Estates",              SpaceType.Lot,          300,   8);
        spaces[38] = Space("Supertax",                 SpaceType.Tax,          100,   0);
        spaces[39] = Space("Prosperity Place",         SpaceType.Lot,          400,   8);
    }
}
