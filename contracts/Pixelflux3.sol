// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./BaseContract.sol";
import "./DataStorage3.sol";

contract Pixelflux3 is BaseContract, DataStorage3 {
    function getInitialValue(uint x, uint y) internal override view returns (uint256, string memory) {
        require(x < gridWidth, "Invalid x-coordinate");
        require(y < gridHeight, "Invalid y-coordinate");
        return (initialValues[y][x], colorValues[y][x]);
    }

    function getGridWidth() internal override view returns (uint256) {
        return gridWidth;
    }

    function getGridHeight() internal override view returns (uint256) {
        return gridHeight;
    }
}
