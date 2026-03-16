// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Game mode determines how rent, purchases, and jail work
enum GameMode {
    Monopolist, // Rent -> property owner, punitive jail, monopoly bonus
    Prosperity  // Rent -> treasury -> dividends, rehabilitative jail
}

/// @notice Types of spaces on the board
enum SpaceType {
    Go,             // Collect salary
    Lot,            // Purchasable property
    Railroad,       // Purchasable, rent scales with count owned
    Utility,        // Purchasable, rent based on dice roll
    Tax,            // Pay fixed amount
    Chance,         // No action (dead space)
    CommunityChest, // No action (dead space)
    Jail,           // Visiting only (safe)
    GoToJail,       // Sends player to Jail (mode-dependent)
    FreeParking,    // No action
    Windfall,       // Collect fixed bonus
    Expense         // Pay fixed amount (Monopolist: bank, Prosperity: treasury)
}

/// @notice Why a player was sent to jail
enum JailReason {
    LandedOnGoToJail,    // Landed on the GoToJail space
    CantPayDebt,         // Can't pay after liquidating all properties
    CommonsExploitation  // Prosperity: free-riding the commons
}

/// @notice How a player got out of jail
enum ReleaseMethod {
    Waited,     // Served full sentence
    PaidBuyout  // Paid to leave early (Monopolist only)
}

/// @notice A space on the board
struct Space {
    string name;
    SpaceType spaceType;
    uint256 price;    // Purchase price (lots/railroads/utilities) or payment amount (tax/windfall/expense)
    uint8 colorGroup; // 0 = no group, 1-8 = color groups
}

/// @notice Player state within a game
struct Player {
    address addr;
    uint256 cash;
    uint256 position;
    bool inJail;
    uint8 turnsInJail;
    uint256 lastContributionRound; // Round of last treasury contribution (for Prosperity jail check)
    uint256 dividendsReceived;     // Total dividends received (for Prosperity jail check)
}

/// @notice Property state
struct Property {
    address owner;  // address(0) = unowned
    uint8 houses;   // 0-4
}

/// @notice Full game state returned by getFullState()
struct GameState {
    uint256 gameId;
    uint256 tournamentId;
    GameMode mode;
    uint256 treasury;
    uint256 currentPlayerIndex;
    uint256 round;
    uint256 turnsTaken;
    bool gameOver;
    address winner;
    uint256 lastDice1;
    uint256 lastDice2;
    uint256 modeSwitchCount;
    bool modeSwitchProposed;
    bool votingEnabled;
    uint256 monopolistWinThreshold;
    uint256 prosperityWinThreshold;
    Player[] players;
    Property[40] properties;
}
