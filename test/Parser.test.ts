import { describe, it, expect, test } from '@jest/globals'

// @ts-ignore
window.File = class {
    name: string
    text: () => Promise<string>
    constructor(file: string[], filename: string) {
        // eslint-disable-next-line @typescript-eslint/require-await
        this.text = async function() {
            return file[0]
        }
        this.name = filename
    }
}

import { analyzeFiles, Transaction } from '../src/index'

import { empty, gibberish, multipletransactions, onetransaction, wrongformat } from "./XMLs"

describe("Testing parser camt.054 files", () => {
    it("should throw an error because it is empty",  async () => {
        await expect(analyzeFiles([new File([empty], "")])).rejects.toThrow("Il formato del file non è corretto")
    })


    it("should throw an error because it is gibberis", async() => {
        await expect(analyzeFiles([new File([gibberish], "")])).rejects.toThrow("Il formato del file non è corretto")
    })

    test.each(Object.entries(wrongformat))('testing wrong format: %s', async(key, file) => {
        await expect(analyzeFiles([new File([file], "")])).rejects.toThrow(new RegExp("^(Il file non rispetta la struttura dei documenti CAMT.054)$"))
    })

    it("test one transaction parsing", async () => {
        expect(await analyzeFiles([new File([onetransaction], "test")])).toEqual([{
            accountServicerReference: '210616CH0780O664',
            reference: '002021010012550000000068140',
            amount: 85.80,
            charges: 1.60,
            acceptanceDateTime: new Date('2021-06-15T20:00:00'),

            filename: 'test',
            fromDateTime: new Date('2021-06-16T00:00:00'),
            toDateTime: new Date('2021-06-22T23:59:59')
        }] as Transaction[])
    })

    it("test multiple transactions parsing", async () => {
        expect(await analyzeFiles([new File([multipletransactions], "test")])).toEqual([{
            accountServicerReference: '201220CH06GHN1L6',
            reference: '000000000000202128000015089',
            amount: 3,
            charges: 0,
            acceptanceDateTime: new Date('2020-12-31T20:00:00'),

            filename: 'test',
            fromDateTime: new Date('2020-12-31T00:00:00'),
            toDateTime: new Date('2021-01-05T23:59:59')
        }, {
            accountServicerReference: '201231CH06IF4LDU',
            reference: '000000000000202106000010060',
            amount: 40,
            charges: 1.60,
            acceptanceDateTime: new Date('2020-12-30T20:00:00'),

            filename: 'test',
            fromDateTime: new Date('2020-12-31T00:00:00'),
            toDateTime: new Date('2021-01-05T23:59:59')
        }, {
            accountServicerReference: '210104CH06IV23IO',
            reference: '000000000000202128000015089',
            amount: 77.20,
            charges: 0,
            acceptanceDateTime: new Date('2021-01-05T20:00:00'),

            filename: 'test',
            fromDateTime: new Date('2020-12-31T00:00:00'),
            toDateTime: new Date('2021-01-05T23:59:59')
        }, {
            accountServicerReference: '210105CH06IZOIZ2',
            reference: '002020090023330000000063306',
            amount: 63.80,
            charges: 1.60,
            acceptanceDateTime: new Date('2021-01-04T20:00:00'),

            filename: 'test',
            fromDateTime: new Date('2020-12-31T00:00:00'),
            toDateTime: new Date('2021-01-05T23:59:59')
        }] as Transaction[])
    })
})