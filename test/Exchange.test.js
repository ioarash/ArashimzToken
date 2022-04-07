const { default: Web3 } = require('web3')

import { use } from 'chai'
import { ether, tokens, EVM_REVERT, EVM_BAD_ADDRESS, ETHER_ADDRESS } from './helpers'

const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should()

contract('Exchange', ([deployer, feeAccount, user1]) => {

    let token
    let exchange
    const feePercent = 10

    beforeEach(async () => {

        //deploy token
        token = await Token.new()

        //transfer token to user1
        exchange = await Exchange.new(feeAccount, feePercent)

        //deploy exchange
        token.transfer(user1, tokens(100), { from: deployer })
    })

    describe('deployment', () => {

        it('tracks the fee account', async () => {
            
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)

        })

        it('tracks the fee percent', async () => {
            
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())

        })

        
    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
          await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
      })
    

    describe('depositing Ether', () => {
        let result
        let amount
        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({ from: user1, value: amount})
        })

        it('tracks the ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.be.eq(amount.toString())
        })

        it('emits deposit event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Deposit')
            const event = log.args
            event.token.should.be.eq(ETHER_ADDRESS, 'token address is correct.')
            event.user.should.be.eq(user1, 'user address is corrrect')
            event.amount.toString().should.eq(amount.toString(), 'amount is correct')
            event.balance.toString().should.eq(amount.toString(), 'balance is correct')
        })
    })

    describe('depositing tokens', () => {
        let result
        let amount


        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1})
                result = await exchange.depositToken(token.address, amount, { from: user1})
            })

            it('tracks the token deposit', async () => {
                // check exchange token balance
                let balance
                balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
                //check token on exchange
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits deposit event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Deposit')
                const event = log.args
                event.token.should.be.eq(token.address, 'token address is correct.')
                event.user.should.be.eq(user1, 'user address is corrrect')
                event.amount.toString().should.eq(amount.toString(), 'amount is correct')
                event.balance.toString().should.eq(amount.toString(), 'balance is correct')
            })
        })

        describe('failure', () => {

            it('rejects ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails when no token approved', async () => {
                await exchange.depositToken(token.address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })  
    })
})