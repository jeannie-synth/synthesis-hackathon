// Auto-generated from contracts/out/LandlordsGame.sol/LandlordsGame.json
export const LANDLORDS_GAME_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "BOARD_SIZE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DEFAULT_MONOPOLIST_WIN",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DEFAULT_PROSPERITY_WIN",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "HOUSE_COST",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "HOUSE_RENT_BONUS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "JAIL_FEE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "JAIL_POSITION",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_HOUSES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MONOPOLIST_JAIL_TURNS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROSPERITY_JAIL_TURNS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "SALARY",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "STARTING_CASH",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "TREASURY_THRESHOLD",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "buildHouse",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "position",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buyProperty",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createGame",
    "inputs": [
      {
        "name": "tournamentId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "mode",
        "type": "uint8",
        "internalType": "enum GameMode"
      },
      {
        "name": "playerAddrs",
        "type": "address[]",
        "internalType": "address[]"
      },
      {
        "name": "monopolistThreshold",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "prosperityThreshold",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "votingEnabled",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "endTurn",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "games",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "tournamentId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "mode",
        "type": "uint8",
        "internalType": "enum GameMode"
      },
      {
        "name": "playerCount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "treasury",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "currentPlayerIndex",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "round",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "turnsTaken",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "gameOver",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "winner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "lastDice1",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastDice2",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "modeSwitchCount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "hasRolled",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "votingEnabled",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "modeSwitchProposed",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "modeSwitchProposer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "modeSwitchVotesFor",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "modeSwitchVotesAgainst",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "monopolistWinThreshold",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "prosperityWinThreshold",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFullState",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "state",
        "type": "tuple",
        "internalType": "struct GameState",
        "components": [
          {
            "name": "gameId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "tournamentId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "mode",
            "type": "uint8",
            "internalType": "enum GameMode"
          },
          {
            "name": "treasury",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "currentPlayerIndex",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "round",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "turnsTaken",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "gameOver",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "winner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "lastDice1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastDice2",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "modeSwitchCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "modeSwitchProposed",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "votingEnabled",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "monopolistWinThreshold",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "prosperityWinThreshold",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "players",
            "type": "tuple[]",
            "internalType": "struct Player[]",
            "components": [
              {
                "name": "addr",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "cash",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "position",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "inJail",
                "type": "bool",
                "internalType": "bool"
              },
              {
                "name": "turnsInJail",
                "type": "uint8",
                "internalType": "uint8"
              },
              {
                "name": "lastContributionRound",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "dividendsReceived",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "properties",
            "type": "tuple[40]",
            "internalType": "struct Property[40]",
            "components": [
              {
                "name": "owner",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "houses",
                "type": "uint8",
                "internalType": "uint8"
              }
            ]
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNetWorth",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "playerIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayer",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Player",
        "components": [
          {
            "name": "addr",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "cash",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "position",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "inJail",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "turnsInJail",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "lastContributionRound",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "dividendsReceived",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerCount",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProperty",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "position",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Property",
        "components": [
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "houses",
            "type": "uint8",
            "internalType": "uint8"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSpace",
    "inputs": [
      {
        "name": "position",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Space",
        "components": [
          {
            "name": "name",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "spaceType",
            "type": "uint8",
            "internalType": "enum SpaceType"
          },
          {
            "name": "price",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "colorGroup",
            "type": "uint8",
            "internalType": "uint8"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinGame",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "nextGameId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "payJailBuyout",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeModeSwitch",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rollAndMove",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "spaces",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "spaceType",
        "type": "uint8",
        "internalType": "enum SpaceType"
      },
      {
        "name": "price",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "colorGroup",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "voteModeSwitch",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "inFavor",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "waitInJail",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "DividendCollected",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameCreated",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "tournamentId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "mode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GameMode"
      },
      {
        "name": "players",
        "type": "address[]",
        "indexed": false,
        "internalType": "address[]"
      },
      {
        "name": "monopolistThreshold",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "prosperityThreshold",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GameWon",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "mode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GameMode"
      },
      {
        "name": "round",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "turnsTaken",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "winnerNetWorth",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "allPlayerNetWorths",
        "type": "uint256[]",
        "indexed": false,
        "internalType": "uint256[]"
      },
      {
        "name": "finalTreasury",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "HouseBuilt",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "position",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalHouses",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "newCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModeSwitchProposed",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "proposer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "currentMode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GameMode"
      },
      {
        "name": "proposedMode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GameMode"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModeSwitchRejected",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "proposer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "round",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "votesFor",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "votesAgainst",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModeSwitchVote",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "voter",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "inFavor",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "votesFor",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "votesAgainst",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ModeSwitched",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "oldMode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GameMode"
      },
      {
        "name": "newMode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GameMode"
      },
      {
        "name": "round",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "votesFor",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "votesAgainst",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PlayerMoved",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fromPos",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "toPos",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "dice1",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "dice2",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PropertyBought",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "position",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "propertyName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "price",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PropertyLiquidated",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "position",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "faceValue",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "creditor",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "remainingDebt",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReleasedFromJail",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "method",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum ReleaseMethod"
      },
      {
        "name": "turnsMissed",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "feePaid",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RentPaid",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "payer",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "recipient",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "position",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "payerNewCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "recipientNewCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RentToTreasury",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "payer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "position",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "payerNewCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newTreasuryBalance",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SalaryCollected",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SentToJail",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "reason",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum JailReason"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TaxPaid",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "position",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newCash",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newTreasuryBalance",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TreasuryDividend",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "treasuryBefore",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountPerPlayer",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "playerCount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TurnStarted",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "round",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "turnsTaken",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyJoined",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyRolled",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyVoted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CantBuyInProsperityPark",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameAlreadyStarted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameFull",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GameNotActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientFunds",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPosition",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MaxHousesReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MustRollFirst",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoBuyoutInProsperity",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoSwitchProposed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotInJail",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotPropertyOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotYourTurn",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PlayerInJail",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PropertyNotAvailable",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SwitchAlreadyProposed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "VotePending",
    "inputs": []
  },
  {
    "type": "error",
    "name": "VotingDisabled",
    "inputs": []
  }
] as const;
