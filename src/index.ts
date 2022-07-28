interface CAMT {
    Document: {
        BkToCstmrDbtCdtNtfctn: {
            Ntfctn: {
                FrToDt: {
                    FrDtTm: string,
                    ToDtTm: string,
                },
                Ntry: Array<Entry> | Entry
            }
        };
    }
}

interface Entry {
    NtryDtls: {
        TxDtls: Array<TransactionDetails> | TransactionDetails
    }
}

interface TransactionDetails {
    RmtInf: {
        Strd: {
            CdtrRefInf: {
                Ref: string
            }
        }
    };
    Amt: {
        __text: string
    };
    Chrgs: {
        TtlChrgsAndTaxAmt?: {
            __text: string
        }
    };
    Refs: {
        AcctSvcrRef: string
    };
    RltdDts: {
        AccptncDtTm: string
    };

}

interface Transaction {
    reference: string
    amount: number,
    charges: number,
    accountServicerReference: string
    acceptanceDateTime: Date

    filename: string,
    fromDateTime: Date,
    toDateTime: Date
}

type RecursivePartial<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [P in keyof T]?: RecursivePartial<T[P]>
}

export { Transaction, CAMT, TransactionDetails, Entry }

import X2JS from 'x2js'

export const parseXMLTransactions = (XMLTransactions: (RecursivePartial<TransactionDetails> | undefined)[], filename: string, fromDateTime: Date, toDateTime: Date): Transaction[] => {
    const transactions: Transaction[] = []

    XMLTransactions.forEach((transaction) => {
        if (!transaction || !transaction?.RmtInf?.Strd?.CdtrRefInf?.Ref || !transaction?.Amt?.__text || !transaction?.Refs?.AcctSvcrRef || !transaction?.RltdDts?.AccptncDtTm) {
            throw new Error('Il file non rispetta la struttura dei documenti CAMT.054')
        }

        transactions.push({
            reference: transaction.RmtInf.Strd.CdtrRefInf.Ref,
            amount: parseFloat(transaction.Amt.__text),
            charges: parseFloat(transaction?.Chrgs?.TtlChrgsAndTaxAmt?.__text || "") || 0,
            accountServicerReference: transaction.Refs.AcctSvcrRef,
            acceptanceDateTime: new Date(transaction.RltdDts.AccptncDtTm),

            filename,
            fromDateTime,
            toDateTime
        })
    })

    return transactions
}

export const parseXMLEntries = (xml: RecursivePartial<CAMT>, filename: string, fromDateTime: Date, toDateTime: Date): Transaction[] => {
    if (!xml?.Document?.BkToCstmrDbtCdtNtfctn?.Ntfctn?.Ntry) {
        throw new Error('Il file non rispetta la struttura dei documenti CAMT.054')
    }

    let entries
    const transactions: Transaction[] = []

    if (Array.isArray(xml.Document.BkToCstmrDbtCdtNtfctn.Ntfctn.Ntry)) {
        entries = xml.Document.BkToCstmrDbtCdtNtfctn.Ntfctn.Ntry
    } else {
        entries = [xml.Document.BkToCstmrDbtCdtNtfctn.Ntfctn.Ntry]
    }

    entries.forEach((entry) => {
        if (!entry?.NtryDtls?.TxDtls) {
            throw Error('Il file non rispetta la struttura dei documenti CAMT.054')
        }

        let localTransactions
        if (!Array.isArray(entry.NtryDtls.TxDtls)) {
            localTransactions = [entry.NtryDtls.TxDtls]
        } else {
            localTransactions = entry.NtryDtls.TxDtls
        }

        transactions.push(...parseXMLTransactions(localTransactions, filename, fromDateTime, toDateTime))
    })

    return transactions
}

export const parseXMLDateTime = (xml: RecursivePartial<CAMT>): [Date, Date] => {
    if (!xml?.Document?.BkToCstmrDbtCdtNtfctn?.Ntfctn?.FrToDt?.FrDtTm || !xml.Document?.BkToCstmrDbtCdtNtfctn.Ntfctn.FrToDt.ToDtTm) {
        throw new Error('Il file non rispetta la struttura dei documenti CAMT.054')
    }

    const fromDateTime = new Date(xml.Document.BkToCstmrDbtCdtNtfctn.Ntfctn.FrToDt.FrDtTm)
    const toDateTime = new Date(xml.Document.BkToCstmrDbtCdtNtfctn.Ntfctn.FrToDt.ToDtTm)

    return [fromDateTime, toDateTime]
}

export const parseXMLText = (text: string, filename: string): Transaction[] => {
    const x2js = new X2JS()

    const xml = x2js.xml2js<RecursivePartial<CAMT> | undefined>(text)
    if (typeof xml !== "object" || xml == null || Object.keys(xml).length == 0) {
        throw new Error('Il formato del file non è corretto')
    }

    const [fromDateTime, toDateTime] = parseXMLDateTime(xml)
    const transactions = parseXMLEntries(xml, filename, fromDateTime, toDateTime)

    return transactions
}

export const analyzeFiles = async (files: Array<File>): Promise<Transaction[]> => {
    const transactions: Transaction[] = []

    for (const file of files) {
        const text = await file.text()

        transactions.push(...parseXMLText(text, file.name))
    }

    return transactions
}