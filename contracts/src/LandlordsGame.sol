// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {GameMode, SpaceType, Space, Player, Property, GameState, JailReason, ReleaseMethod} from "./Types.sol";
import {Board} from "./Board.sol";

/// @title The Landlord's Game — On-chain multi-agent economic simulation
/// @notice One deploy, unlimited games. Same board, two rule sets, radically different outcomes.
/// @dev Multi-game architecture: all state keyed by gameId. Board is shared across games.
contract LandlordsGame {
    // ============ Constants ============
    uint256 public constant STARTING_CASH = 500;
    uint256 public constant SALARY = 200;
    uint256 public constant JAIL_FEE = 50;
    uint256 public constant HOUSE_COST = 50;
    uint256 public constant HOUSE_RENT_BONUS = 10;
    uint256 public constant MAX_HOUSES = 4;
    uint256 public constant TREASURY_THRESHOLD = 500;
    uint256 public constant MONOPOLIST_JAIL_TURNS = 3;
    uint256 public constant PROSPERITY_JAIL_TURNS = 1;
    uint256 public constant DEFAULT_MONOPOLIST_WIN = 2000;
    uint256 public constant DEFAULT_PROSPERITY_WIN = 1000;
    uint8 public constant BOARD_SIZE = 40;
    uint8 public constant JAIL_POSITION = 10;

    // ============ Shared Board State ============
    mapping(uint256 => Space) public spaces;

    // ============ Multi-Game State ============
    uint256 public nextGameId = 1;

    struct GameCore {
        uint256 tournamentId;
        GameMode mode;
        uint256 playerCount;
        uint256 treasury;
        uint256 currentPlayerIndex;
        uint256 round;
        uint256 turnsTaken;
        bool gameOver;
        address winner;
        uint256 lastDice1;
        uint256 lastDice2;
        uint256 modeSwitchCount;
        bool hasRolled;
        // Mode switch voting
        bool votingEnabled;
        bool modeSwitchProposed;
        address modeSwitchProposer;
        uint256 modeSwitchVotesFor;
        uint256 modeSwitchVotesAgainst;
        // Win thresholds (configurable per game)
        uint256 monopolistWinThreshold;
        uint256 prosperityWinThreshold;
    }

    mapping(uint256 => GameCore) public games;
    mapping(uint256 => Player[]) internal gamePlayers;
    mapping(uint256 => mapping(uint256 => Property)) internal gameProperties;
    mapping(uint256 => mapping(address => bool)) internal hasVotedOnSwitch;

    // ============ Events (19) ============
    event GameCreated(
        uint256 indexed gameId, uint256 tournamentId, GameMode mode,
        address[] players, uint256 monopolistThreshold, uint256 prosperityThreshold
    );
    event TurnStarted(uint256 indexed gameId, address indexed player, uint256 round, uint256 turnsTaken);
    event PlayerMoved(uint256 indexed gameId, address indexed player, uint256 fromPos, uint256 toPos, uint256 dice1, uint256 dice2);
    event SalaryCollected(uint256 indexed gameId, address indexed player, uint256 amount, uint256 newCash);
    event PropertyBought(uint256 indexed gameId, address indexed player, uint256 position, string propertyName, uint256 price, uint256 newCash);
    event RentPaid(
        uint256 indexed gameId, address payer, address recipient,
        uint256 position, uint256 amount, uint256 payerNewCash, uint256 recipientNewCash
    );
    event RentToTreasury(uint256 indexed gameId, address indexed payer, uint256 position, uint256 amount, uint256 payerNewCash, uint256 newTreasuryBalance);
    event TaxPaid(uint256 indexed gameId, address indexed player, uint256 position, uint256 amount, uint256 newCash, uint256 newTreasuryBalance);
    event HouseBuilt(uint256 indexed gameId, address indexed player, uint256 position, uint8 totalHouses, uint256 newCash);
    event TreasuryDividend(uint256 indexed gameId, uint256 treasuryBefore, uint256 amountPerPlayer, uint256 playerCount);
    event DividendCollected(uint256 indexed gameId, address indexed player, uint256 amount, uint256 newCash);
    event PropertyLiquidated(uint256 indexed gameId, address indexed player, uint256 position, uint256 faceValue, address creditor, uint256 remainingDebt);
    event SentToJail(uint256 indexed gameId, address indexed player, JailReason reason);
    event ReleasedFromJail(uint256 indexed gameId, address indexed player, ReleaseMethod method, uint8 turnsMissed, uint256 feePaid);
    event ModeSwitchProposed(uint256 indexed gameId, address indexed proposer, GameMode currentMode, GameMode proposedMode);
    event ModeSwitchVote(uint256 indexed gameId, address indexed voter, bool inFavor, uint256 votesFor, uint256 votesAgainst);
    event ModeSwitched(uint256 indexed gameId, GameMode oldMode, GameMode newMode, uint256 round, uint256 votesFor, uint256 votesAgainst);
    event ModeSwitchRejected(uint256 indexed gameId, address indexed proposer, uint256 round, uint256 votesFor, uint256 votesAgainst);
    event GameWon(
        uint256 indexed gameId, address indexed winner, GameMode mode,
        uint256 round, uint256 turnsTaken, uint256 winnerNetWorth,
        uint256[] allPlayerNetWorths, uint256 finalTreasury
    );

    // ============ Errors ============
    error NotYourTurn();
    error GameNotActive();
    error GameAlreadyStarted();
    error GameFull();
    error AlreadyJoined();
    error PropertyNotAvailable();
    error InsufficientFunds();
    error NotPropertyOwner();
    error MaxHousesReached();
    error InvalidPosition();
    error AlreadyVoted();
    error NoSwitchProposed();
    error SwitchAlreadyProposed();
    error PlayerInJail();
    error NotInJail();
    error MustRollFirst();
    error AlreadyRolled();
    error VotePending();
    error NoBuyoutInProsperity();
    error CantBuyInProsperityPark();
    error VotingDisabled();

    // ============ Constructor ============
    constructor() {
        Board.initSpaces(spaces);
    }

    // ============ Game Lifecycle ============

    /// @notice Create a new game. Pass 0 for thresholds to use defaults.
    /// @param tournamentId Links game to experimental condition (queryable on-chain)
    /// @param mode Starting rule set
    /// @param playerAddrs Array of player addresses (2-6 players)
    /// @param monopolistThreshold Net worth to win in Monopolist mode (0 = default 2000)
    /// @param prosperityThreshold Poorest player net worth to win in Prosperity mode (0 = default 1000)
    function createGame(
        uint256 tournamentId,
        GameMode mode,
        address[] calldata playerAddrs,
        uint256 monopolistThreshold,
        uint256 prosperityThreshold,
        bool votingEnabled
    ) external returns (uint256 gameId) {
        require(playerAddrs.length >= 2 && playerAddrs.length <= 6, "2-6 players");

        gameId = nextGameId++;
        GameCore storage g = games[gameId];
        g.tournamentId = tournamentId;
        g.mode = mode;
        g.playerCount = playerAddrs.length;
        g.votingEnabled = votingEnabled;
        g.monopolistWinThreshold = monopolistThreshold > 0 ? monopolistThreshold : DEFAULT_MONOPOLIST_WIN;
        g.prosperityWinThreshold = prosperityThreshold > 0 ? prosperityThreshold : DEFAULT_PROSPERITY_WIN;

        for (uint256 i = 0; i < playerAddrs.length; i++) {
            gamePlayers[gameId].push(Player({
                addr: playerAddrs[i],
                cash: STARTING_CASH,
                position: 0,
                inJail: false,
                turnsInJail: 0,
                lastContributionRound: 0,
                dividendsReceived: 0
            }));
        }

        emit GameCreated(gameId, tournamentId, mode, playerAddrs, g.monopolistWinThreshold, g.prosperityWinThreshold);
    }

    /// @notice Join an existing game before it starts (mainnet open registration)
    function joinGame(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        if (g.turnsTaken > 0) revert GameAlreadyStarted();
        if (g.playerCount >= 6) revert GameFull();

        Player[] storage players = gamePlayers[gameId];
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i].addr == msg.sender) revert AlreadyJoined();
        }

        players.push(Player({
            addr: msg.sender,
            cash: STARTING_CASH,
            position: 0,
            inJail: false,
            turnsInJail: 0,
            lastContributionRound: 0,
            dividendsReceived: 0
        }));
        g.playerCount++;
    }

    // ============ Turn Actions ============

    /// @notice Roll dice and move. Handles all landing effects (rent, tax, jail, dividends).
    function rollAndMove(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (player.inJail) revert PlayerInJail();
        if (g.hasRolled) revert AlreadyRolled();
        if (g.modeSwitchProposed) revert VotePending();

        g.turnsTaken++;
        g.hasRolled = true;
        emit TurnStarted(gameId, player.addr, g.round, g.turnsTaken);

        // Roll 2d6 with proper bell-curve distribution
        (uint256 d1, uint256 d2) = _rollDice(gameId);
        g.lastDice1 = d1;
        g.lastDice2 = d2;
        uint256 total = d1 + d2;

        uint256 oldPos = player.position;
        uint256 newPos = (oldPos + total) % BOARD_SIZE;

        // Salary for passing GO
        if (newPos < oldPos) {
            player.cash += SALARY;
            emit SalaryCollected(gameId, player.addr, SALARY, player.cash);
        }

        player.position = newPos;
        emit PlayerMoved(gameId, player.addr, oldPos, newPos, d1, d2);

        // Handle landing effects
        _processLanding(gameId, g.currentPlayerIndex);
    }

    /// @notice Buy the property at current position (call after rollAndMove)
    function buyProperty(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (!g.hasRolled) revert MustRollFirst();
        if (player.inJail) revert PlayerInJail();

        uint256 pos = player.position;

        // Lord Blueblood's Estate is a public park in Prosperity mode
        if (pos == 17 && g.mode == GameMode.Prosperity) revert CantBuyInProsperityPark();

        if (!_isPropertySpace(pos)) revert InvalidPosition();
        if (gameProperties[gameId][pos].owner != address(0)) revert PropertyNotAvailable();
        if (player.cash < spaces[pos].price) revert InsufficientFunds();

        player.cash -= spaces[pos].price;
        gameProperties[gameId][pos].owner = player.addr;

        // In Prosperity mode, purchase price goes to treasury
        if (g.mode == GameMode.Prosperity) {
            g.treasury += spaces[pos].price;
            player.lastContributionRound = g.round;
        }

        emit PropertyBought(gameId, player.addr, pos, spaces[pos].name, spaces[pos].price, player.cash);
    }

    /// @notice Build a house on an owned Lot (call after rollAndMove)
    function buildHouse(uint256 gameId, uint256 position) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (!g.hasRolled) revert MustRollFirst();
        if (player.inJail) revert PlayerInJail();

        if (spaces[position].spaceType != SpaceType.Lot) revert InvalidPosition();
        if (gameProperties[gameId][position].owner != msg.sender) revert NotPropertyOwner();
        if (gameProperties[gameId][position].houses >= MAX_HOUSES) revert MaxHousesReached();
        if (player.cash < HOUSE_COST) revert InsufficientFunds();

        player.cash -= HOUSE_COST;
        gameProperties[gameId][position].houses++;

        emit HouseBuilt(gameId, player.addr, position, gameProperties[gameId][position].houses, player.cash);
    }

    /// @notice End your turn. Checks win conditions and advances to next player.
    function endTurn(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (!g.hasRolled) revert MustRollFirst();

        g.hasRolled = false;

        if (!g.gameOver) {
            _checkWinConditions(gameId);
        }
        if (!g.gameOver) {
            _nextTurn(gameId);
        }
    }

    // ============ Jail ============

    /// @notice Pay to leave jail early (Monopolist mode only).
    /// @dev Buyout cost decreases with time served: JAIL_FEE * (maxTurns - turnsServed)
    function payJailBuyout(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (!player.inJail) revert NotInJail();
        if (g.mode == GameMode.Prosperity) revert NoBuyoutInProsperity();

        uint256 buyoutCost = JAIL_FEE * (MONOPOLIST_JAIL_TURNS - uint256(player.turnsInJail));
        if (player.cash < buyoutCost) revert InsufficientFunds();

        player.cash -= buyoutCost;
        uint8 turnsMissed = player.turnsInJail;
        player.inJail = false;
        player.turnsInJail = 0;

        emit ReleasedFromJail(gameId, player.addr, ReleaseMethod.PaidBuyout, turnsMissed, buyoutCost);
        // Player can now call rollAndMove
    }

    /// @notice Wait in jail. Released automatically when sentence is served. Ends turn.
    function waitInJail(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (!player.inJail) revert NotInJail();

        g.turnsTaken++;
        emit TurnStarted(gameId, player.addr, g.round, g.turnsTaken);

        player.turnsInJail++;
        uint256 maxTurns = g.mode == GameMode.Monopolist ? MONOPOLIST_JAIL_TURNS : PROSPERITY_JAIL_TURNS;

        if (uint256(player.turnsInJail) >= maxTurns) {
            uint8 turnsMissed = player.turnsInJail;
            player.inJail = false;
            player.turnsInJail = 0;
            emit ReleasedFromJail(gameId, player.addr, ReleaseMethod.Waited, turnsMissed, 0);
        }

        _nextTurn(gameId);
    }

    // ============ Mode Switching (Propose-and-Risk) ============

    /// @notice Propose a mode switch. Must be called before rolling. If rejected, your turn ends.
    function proposeModeSwitch(uint256 gameId) external {
        GameCore storage g = games[gameId];
        if (g.gameOver) revert GameNotActive();
        if (!g.votingEnabled) revert VotingDisabled();
        Player storage player = gamePlayers[gameId][g.currentPlayerIndex];
        if (player.addr != msg.sender) revert NotYourTurn();
        if (g.hasRolled) revert AlreadyRolled(); // Must propose before rolling
        if (g.modeSwitchProposed) revert SwitchAlreadyProposed();

        g.modeSwitchProposed = true;
        g.modeSwitchProposer = msg.sender;
        g.modeSwitchVotesFor = 0;
        g.modeSwitchVotesAgainst = 0;

        // Clear previous votes
        Player[] storage players = gamePlayers[gameId];
        for (uint256 i = 0; i < players.length; i++) {
            hasVotedOnSwitch[gameId][players[i].addr] = false;
        }

        GameMode proposed = g.mode == GameMode.Monopolist ? GameMode.Prosperity : GameMode.Monopolist;
        emit ModeSwitchProposed(gameId, msg.sender, g.mode, proposed);
    }

    /// @notice Vote on a proposed mode switch. All players except the proposer vote.
    function voteModeSwitch(uint256 gameId, bool inFavor) external {
        GameCore storage g = games[gameId];
        if (!g.modeSwitchProposed) revert NoSwitchProposed();
        if (hasVotedOnSwitch[gameId][msg.sender]) revert AlreadyVoted();
        require(msg.sender != g.modeSwitchProposer, "Proposer cannot vote");

        // Verify sender is a player in this game
        bool isPlayer = false;
        Player[] storage players = gamePlayers[gameId];
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i].addr == msg.sender) {
                isPlayer = true;
                break;
            }
        }
        require(isPlayer, "Not a player");

        hasVotedOnSwitch[gameId][msg.sender] = true;
        if (inFavor) {
            g.modeSwitchVotesFor++;
        } else {
            g.modeSwitchVotesAgainst++;
        }
        emit ModeSwitchVote(gameId, msg.sender, inFavor, g.modeSwitchVotesFor, g.modeSwitchVotesAgainst);

        // Check if all non-proposer players have voted
        uint256 expectedVotes = g.playerCount - 1; // Proposer doesn't vote
        if (g.modeSwitchVotesFor + g.modeSwitchVotesAgainst == expectedVotes) {
            g.modeSwitchProposed = false;

            if (g.modeSwitchVotesFor + 1 > g.modeSwitchVotesAgainst) {
                // Vote passed — proposer's implicit vote (+1) included. No ties with odd total.
                GameMode oldMode = g.mode;
                g.mode = g.mode == GameMode.Monopolist ? GameMode.Prosperity : GameMode.Monopolist;
                g.modeSwitchCount++;
                emit ModeSwitched(gameId, oldMode, g.mode, g.round, g.modeSwitchVotesFor, g.modeSwitchVotesAgainst);
            } else {
                // Vote rejected — proposer's turn ends
                emit ModeSwitchRejected(gameId, g.modeSwitchProposer, g.round, g.modeSwitchVotesFor, g.modeSwitchVotesAgainst);
                g.turnsTaken++;
                emit TurnStarted(gameId, g.modeSwitchProposer, g.round, g.turnsTaken);
                _nextTurn(gameId);
            }
        }
    }

    // ============ View Functions ============

    /// @notice Get full game state in one call (saves RPC roundtrips)
    function getFullState(uint256 gameId) external view returns (GameState memory state) {
        GameCore storage g = games[gameId];
        Player[] storage players = gamePlayers[gameId];

        state.gameId = gameId;
        state.tournamentId = g.tournamentId;
        state.mode = g.mode;
        state.treasury = g.treasury;
        state.currentPlayerIndex = g.currentPlayerIndex;
        state.round = g.round;
        state.turnsTaken = g.turnsTaken;
        state.gameOver = g.gameOver;
        state.winner = g.winner;
        state.lastDice1 = g.lastDice1;
        state.lastDice2 = g.lastDice2;
        state.modeSwitchCount = g.modeSwitchCount;
        state.modeSwitchProposed = g.modeSwitchProposed;
        state.votingEnabled = g.votingEnabled;
        state.monopolistWinThreshold = g.monopolistWinThreshold;
        state.prosperityWinThreshold = g.prosperityWinThreshold;

        state.players = new Player[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            state.players[i] = players[i];
        }

        for (uint256 i = 0; i < BOARD_SIZE; i++) {
            state.properties[i] = gameProperties[gameId][i];
        }
    }

    /// @notice Get a single player's state
    function getPlayer(uint256 gameId, uint256 index) external view returns (Player memory) {
        return gamePlayers[gameId][index];
    }

    /// @notice Get player count for a game
    function getPlayerCount(uint256 gameId) external view returns (uint256) {
        return gamePlayers[gameId].length;
    }

    /// @notice Get a property's state
    function getProperty(uint256 gameId, uint256 position) external view returns (Property memory) {
        return gameProperties[gameId][position];
    }

    /// @notice Get a board space
    function getSpace(uint256 position) external view returns (Space memory) {
        return spaces[position];
    }

    /// @notice Calculate a player's net worth
    function getNetWorth(uint256 gameId, uint256 playerIndex) external view returns (uint256) {
        return _calculateNetWorth(gameId, playerIndex);
    }

    // ============ Internal: Landing Effects ============

    function _processLanding(uint256 gameId, uint256 playerIdx) internal {
        GameCore storage g = games[gameId];
        Player storage player = gamePlayers[gameId][playerIdx];
        uint256 pos = player.position;
        SpaceType st = spaces[pos].spaceType;

        // --- Mode-conditional: Lord Blueblood's Estate (pos 17) ---
        // In Prosperity mode, this is a public park — no rent, no action
        if (pos == 17 && g.mode == GameMode.Prosperity) {
            return;
        }

        // --- GoToJail ---
        if (st == SpaceType.GoToJail) {
            if (g.mode == GameMode.Monopolist) {
                _sendToJail(gameId, playerIdx, JailReason.LandedOnGoToJail);
            } else {
                // Prosperity: jail only if commons exploitation
                // Condition: received dividends AND hasn't contributed in playerCount rounds
                if (player.dividendsReceived > 0 &&
                    g.round >= player.lastContributionRound + g.playerCount) {
                    _sendToJail(gameId, playerIdx, JailReason.CommonsExploitation);
                }
            }
            return;
        }

        // --- Tax ---
        if (st == SpaceType.Tax) {
            uint256 tax = spaces[pos].price;
            uint256 paid = _handlePayment(gameId, playerIdx, tax, address(0));
            if (g.mode == GameMode.Prosperity) {
                g.treasury += paid;
                if (paid > 0) player.lastContributionRound = g.round;
            }
            emit TaxPaid(gameId, player.addr, pos, paid, player.cash, g.treasury);
            _checkDividend(gameId);
            return;
        }

        // --- Expense (Family Emergency) ---
        if (st == SpaceType.Expense) {
            uint256 expense = spaces[pos].price;
            uint256 paid = _handlePayment(gameId, playerIdx, expense, address(0));
            if (g.mode == GameMode.Prosperity) {
                g.treasury += paid;
                if (paid > 0) player.lastContributionRound = g.round;
            }
            emit TaxPaid(gameId, player.addr, pos, paid, player.cash, g.treasury);
            _checkDividend(gameId);
            return;
        }

        // --- Windfall (Community Bounty) ---
        if (st == SpaceType.Windfall) {
            player.cash += spaces[pos].price;
            emit SalaryCollected(gameId, player.addr, spaces[pos].price, player.cash);
            return;
        }

        // --- Owned property: pay rent ---
        if (_isPropertySpace(pos)) {
            Property storage prop = gameProperties[gameId][pos];
            if (prop.owner != address(0) && prop.owner != player.addr) {
                uint256 rent = _calculateRent(gameId, pos);

                if (g.mode == GameMode.Monopolist) {
                    uint256 ownerIdx = _findPlayerIndex(gameId, prop.owner);
                    uint256 paid = _handlePayment(gameId, playerIdx, rent, prop.owner);
                    gamePlayers[gameId][ownerIdx].cash += paid;
                    emit RentPaid(gameId, player.addr, prop.owner, pos, paid, player.cash, gamePlayers[gameId][ownerIdx].cash);
                } else {
                    uint256 paid = _handlePayment(gameId, playerIdx, rent, address(0));
                    g.treasury += paid;
                    if (paid > 0) player.lastContributionRound = g.round;
                    emit RentToTreasury(gameId, player.addr, pos, paid, player.cash, g.treasury);
                    _checkDividend(gameId);
                }
            }
        }
    }

    // ============ Internal: Payment & Liquidation ============

    /// @notice Attempt to collect `amount` from a player. Auto-liquidates properties if needed.
    /// @return actualPaid The amount actually collected (may be less if player is destitute)
    function _handlePayment(uint256 gameId, uint256 playerIdx, uint256 amount, address creditor) internal returns (uint256 actualPaid) {
        Player storage player = gamePlayers[gameId][playerIdx];

        // Try cash first
        if (player.cash >= amount) {
            player.cash -= amount;
            return amount;
        }

        // Cash insufficient — use what's available, then liquidate
        uint256 debt = amount - player.cash;
        actualPaid = player.cash;
        player.cash = 0;

        // Auto-liquidate properties in ascending position order until debt is covered
        for (uint256 pos = 0; pos < BOARD_SIZE && debt > 0; pos++) {
            Property storage prop = gameProperties[gameId][pos];
            if (prop.owner == player.addr) {
                uint256 faceValue = spaces[pos].price;
                // Houses are lost on liquidation
                prop.houses = 0;
                prop.owner = address(0);

                emit PropertyLiquidated(gameId, player.addr, pos, faceValue, creditor, debt);

                if (faceValue >= debt) {
                    player.cash += faceValue - debt;
                    actualPaid += debt;
                    debt = 0;
                } else {
                    actualPaid += faceValue;
                    debt -= faceValue;
                }
            }
        }

        // If still can't pay after full liquidation → jail with $0
        if (debt > 0) {
            _sendToJail(gameId, playerIdx, JailReason.CantPayDebt);
        }

        return actualPaid;
    }

    // ============ Internal: Jail ============

    function _sendToJail(uint256 gameId, uint256 playerIdx, JailReason reason) internal {
        Player storage player = gamePlayers[gameId][playerIdx];
        player.position = JAIL_POSITION;
        player.inJail = true;
        player.turnsInJail = 0;
        emit SentToJail(gameId, player.addr, reason);
    }

    // ============ Internal: Rent Calculation ============

    function _calculateRent(uint256 gameId, uint256 pos) internal view returns (uint256) {
        GameCore storage g = games[gameId];
        Space memory space = spaces[pos];
        Property memory prop = gameProperties[gameId][pos];

        if (space.spaceType == SpaceType.Lot) {
            uint256 baseRent = space.price / 10;

            // Monopoly bonus: double rent if owner has all properties in color group (Monopolist only)
            if (g.mode == GameMode.Monopolist && _ownsColorGroup(gameId, prop.owner, space.colorGroup)) {
                baseRent *= 2;
            }

            return baseRent + (uint256(prop.houses) * HOUSE_RENT_BONUS);
        }

        if (space.spaceType == SpaceType.Railroad) {
            uint256 rrCount = _countRailroads(gameId, prop.owner);
            return 25 * rrCount; // $25 per railroad owned
        }

        if (space.spaceType == SpaceType.Utility) {
            uint256 utilCount = _countUtilities(gameId, prop.owner);
            uint256 diceTotal = g.lastDice1 + g.lastDice2;
            return diceTotal * (utilCount == 2 ? 10 : 4);
        }

        return 0;
    }

    // ============ Internal: Dividend ============

    function _checkDividend(uint256 gameId) internal {
        GameCore storage g = games[gameId];
        if (g.mode == GameMode.Prosperity && g.treasury >= TREASURY_THRESHOLD) {
            _distributeDividend(gameId);
        }
    }

    function _distributeDividend(uint256 gameId) internal {
        GameCore storage g = games[gameId];
        Player[] storage players = gamePlayers[gameId];

        uint256 treasuryBefore = g.treasury;
        uint256 perPlayer = g.treasury / g.playerCount;
        g.treasury = 0;

        emit TreasuryDividend(gameId, treasuryBefore, perPlayer, g.playerCount);

        for (uint256 i = 0; i < players.length; i++) {
            players[i].cash += perPlayer;
            players[i].dividendsReceived++;
            emit DividendCollected(gameId, players[i].addr, perPlayer, players[i].cash);
        }
    }

    // ============ Internal: Win Conditions ============

    function _checkWinConditions(uint256 gameId) internal {
        GameCore storage g = games[gameId];
        Player[] storage players = gamePlayers[gameId];

        if (g.mode == GameMode.Monopolist) {
            // First player to reach net worth threshold wins
            for (uint256 i = 0; i < players.length; i++) {
                uint256 nw = _calculateNetWorth(gameId, i);
                if (nw >= g.monopolistWinThreshold) {
                    _declareWinner(gameId, i);
                    return;
                }
            }
        } else {
            // Prosperity: poorest player's net worth reaches threshold (collective floor)
            // Winner is the richest player (same incentive as Monopolist — keeps experiment clean)
            uint256 poorest = type(uint256).max;
            uint256 richest = 0;
            uint256 richestIdx = 0;
            for (uint256 i = 0; i < players.length; i++) {
                uint256 nw = _calculateNetWorth(gameId, i);
                if (nw < poorest) {
                    poorest = nw;
                }
                if (nw > richest) {
                    richest = nw;
                    richestIdx = i;
                }
            }
            if (poorest >= g.prosperityWinThreshold) {
                _declareWinner(gameId, richestIdx);
            }
        }
    }

    function _declareWinner(uint256 gameId, uint256 winnerIdx) internal {
        GameCore storage g = games[gameId];
        Player[] storage players = gamePlayers[gameId];

        g.gameOver = true;
        g.winner = players[winnerIdx].addr;

        uint256[] memory netWorths = new uint256[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            netWorths[i] = _calculateNetWorth(gameId, i);
        }

        emit GameWon(
            gameId, g.winner, g.mode, g.round, g.turnsTaken,
            netWorths[winnerIdx], netWorths, g.treasury
        );
    }

    function _calculateNetWorth(uint256 gameId, uint256 playerIdx) internal view returns (uint256) {
        Player storage player = gamePlayers[gameId][playerIdx];
        uint256 netWorth = player.cash;

        for (uint256 pos = 0; pos < BOARD_SIZE; pos++) {
            Property storage prop = gameProperties[gameId][pos];
            if (prop.owner == player.addr) {
                netWorth += spaces[pos].price;
                netWorth += uint256(prop.houses) * HOUSE_COST;
            }
        }

        return netWorth;
    }

    // ============ Internal: Turn Management ============

    function _nextTurn(uint256 gameId) internal {
        GameCore storage g = games[gameId];
        if (g.gameOver) return;

        g.hasRolled = false;
        g.currentPlayerIndex = (g.currentPlayerIndex + 1) % g.playerCount;

        // Increment round when we wrap back to player 0
        if (g.currentPlayerIndex == 0) {
            g.round++;
        }
    }

    // ============ Internal: Dice ============

    /// @notice Roll 2d6 with proper bell-curve distribution
    /// @dev Uses keccak256 of game state for deterministic-per-block randomness.
    ///      Proper 2d6: each die is independent (1-6), sum follows triangle distribution.
    function _rollDice(uint256 gameId) internal view returns (uint256 d1, uint256 d2) {
        GameCore storage g = games[gameId];
        uint256 hash = uint256(keccak256(abi.encodePacked(
            block.prevrandao, block.timestamp, gameId,
            g.currentPlayerIndex, g.round, g.turnsTaken
        )));
        d1 = (hash % 6) + 1;
        d2 = ((hash >> 8) % 6) + 1;
    }

    // ============ Internal: Board Helpers ============

    function _isPropertySpace(uint256 pos) internal view returns (bool) {
        SpaceType t = spaces[pos].spaceType;
        return t == SpaceType.Lot || t == SpaceType.Railroad || t == SpaceType.Utility;
    }

    function _ownsColorGroup(uint256 gameId, address owner, uint8 group) internal view returns (bool) {
        if (group == 0) return false;
        for (uint256 i = 0; i < BOARD_SIZE; i++) {
            if (spaces[i].colorGroup == group && gameProperties[gameId][i].owner != owner) {
                return false;
            }
        }
        return true;
    }

    function _countRailroads(uint256 gameId, address owner) internal view returns (uint256 count) {
        for (uint256 i = 0; i < BOARD_SIZE; i++) {
            if (spaces[i].spaceType == SpaceType.Railroad && gameProperties[gameId][i].owner == owner) {
                count++;
            }
        }
    }

    function _countUtilities(uint256 gameId, address owner) internal view returns (uint256 count) {
        for (uint256 i = 0; i < BOARD_SIZE; i++) {
            if (spaces[i].spaceType == SpaceType.Utility && gameProperties[gameId][i].owner == owner) {
                count++;
            }
        }
    }

    function _findPlayerIndex(uint256 gameId, address addr) internal view returns (uint256) {
        Player[] storage players = gamePlayers[gameId];
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i].addr == addr) return i;
        }
        revert("Player not found");
    }
}
