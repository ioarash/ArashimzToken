export const tokens = (n) => {
    return new web3.utils.BN( 
        web3.utils.toWei(n.toString(), 'ether') 
        )
}

export const EVM_REVERT = 'Returned error: VM Exception while processing transaction: revert'

export const EVM_BAD_ADDRESS = 'invalid address (arg="_to", coderType="address", value=0)'