// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {LandlordsGame} from "../src/LandlordsGame.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        new LandlordsGame();
        vm.stopBroadcast();
    }
}
