pragma solidity ^0.5.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange {

    using SafeMath for uint;

    //variables
    address public feeAccount; //account that accepts fees
    uint256 public feePercent; //fee percentange
    address constant ETHER = address(0); //stores ether in token mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens;

    //events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount; 
        feePercent = _feePercent; 

        } 

    function() external {
        revert();
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
        // send token to this contract
        // manage deposit/ update balance
        //emit events
    }


}