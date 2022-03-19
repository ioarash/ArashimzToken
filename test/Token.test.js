const { default: Web3 } = require('web3')

import { tokens, EVM_REVERT, EVM_BAD_ADDRESS } from './helpers'

const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should()

contract('Token', ([deployer, receiver, exchange]) => {

    let token

    const name = 'Arshimz'
    const symbol = 'RSH'
    const decimals = '18'
    const totalSupply = tokens(10000000).toString()

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () => {

        it('tracks the name', async () => {
            
            const result = await token.name()
            result.should.equal(name)

        })

        it('tracks the symbol', async () => {

            const result = await token.symbol()
            result.should.equal(symbol)

        })

        it('tracks the decimal', async () => {
            
            const result = await token.decimals()
            result.toString().should.equal(decimals)

        })

        it('tracks the total supply', async () => {
            
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())

        })

        it('assigns the total supply to the deployer', async () => {
            
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())

        })
    })

    describe('sending tokens', () => {
        let amount
        let result

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transfer(receiver, amount, { from: deployer })
            })
    
            it('transfers token balances', async () => {
                let balanceOf
                balanceOf = await token.balanceOf(deployer)
                balanceOf = await token.balanceOf(deployer)
                balanceOf = await token.balanceOf(receiver)
                balanceOf = await token.balanceOf(receiver)
            })
    
            it('emits transfer event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Transfer')
                const event = log.args
                event.from.toString().should.eq(deployer, 'from is correct')
                event.to.toString().should.eq(receiver, 'to is correct')
                event.value.toString().should.eq(amount.toString(), 'amount is correct')
            })
        })

        describe('failure', () => {
            it('rejects insufficient balances', async () => {
                let invalidAmount
                invalidAmount = tokens(100000000000000)
                await token.transfer(receiver, invalidAmount, { from : deployer}).should.be.rejectedWith(EVM_REVERT)
            })

            it('sender has nothing', async () => {
                let invalidAmount
                invalidAmount = tokens(10)
                await token.transfer(deployer, invalidAmount, { from : receiver}).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid recipient', async () => {
                await token.transfer(0x0, tokens(10), { from: deployer }).should.be.rejectedWith(EVM_BAD_ADDRESS)
            })
        })

        
    })
    
    describe('approving tokens', () => {
        let result
        let amount
        
        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, { from: deployer })
        })

        describe('success', () => {
                it('allocates an allowance for deligated token spending on an exchange', async () => {
                    const allowance = await token.allowance( deployer, exchange)
                    allowance.toString().should.equal(amount.toString())
                })

                it('emits approval event', async () => {
                    const log = result.logs[0]
                    log.event.should.eq('Approval')
                    const event = log.args
                    event.owner.toString().should.eq(deployer, 'owner is correct')
                    event.spender.toString().should.eq(exchange, 'spender is correct')
                    event.value.toString().should.eq(amount.toString(), 'amount is correct')
                })
        })

        describe('failure', () => {
            it('rejects invalid recipient', async () => {
                await token.transfer(0x0, tokens(10), { from: deployer }).should.be.rejectedWith(EVM_BAD_ADDRESS)
            })
        })

    })

    describe('deligate token transfers', () => {
        let amount
        let result

        beforeEach(async () => {
            amount = tokens(100)
            await token.approve(exchange, amount, { from: deployer })
        })

        describe('success', () => {
            beforeEach(async () => {( exchange, amount, { from: deployer})
                result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
            })
    
            it('transfers token balances', async () => {
                let balanceOf
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.eq(tokens(9999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.eq(tokens(100).toString())
            })
    
            it('resets the allowance', async () => {
                const allowance = await token.allowance( deployer, exchange)
                allowance.toString().should.equal('0')
            })

            it('emits transfer event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Transfer')
                const event = log.args
                event.from.toString().should.eq(deployer, 'from is correct')
                event.to.toString().should.eq(receiver, 'to is correct')
                event.value.toString().should.eq(amount.toString(), 'amount is correct')
            })
        })

        describe('failure', () => {
            it('rejects insufficient balances', async () => {
                
                const invalidAmount = tokens(100000000000000)
                await token.transferFrom(deployer, receiver, invalidAmount, { from : exchange}).should.be.rejectedWith(EVM_REVERT)
            })

            // it('sender has nothing', async () => {
            //     let invalidAmount
            //     invalidAmount = tokens(10)
            //     await token.transfer(deployer, invalidAmount, { from : receiver}).should.be.rejectedWith(EVM_REVERT)
            // })

            it('rejects invalid recipient', async () => {
                await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected
            })
        })
    })
})