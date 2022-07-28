import empty from './test_empty.xml'
import gibberish from './test_gibberish.xml'
import onetransaction from './test_one_transaction.xml'
import multipletransactions from './test_multiple_transactions.xml'

import noperiod from './test_no_period.xml'
import emptyperiod from './test_empty_period.xml'
import camt053 from './test_wrong_camt_053.xml'
import nontry from './test_no_ntry.xml'
import notxdls from './test_no_txdls.xml'
import noref from './test_no_ref.xml'
import emptyref from './test_empty_ref.xml'
import noamount from './test_no_amount.xml'
import emptyamount from './test_empty_amount.xml'

const wrongformat = {
    noperiod, emptyperiod, camt053, nontry, notxdls, noref, emptyref, noamount, emptyamount
}

export { empty, gibberish, wrongformat, onetransaction, multipletransactions }