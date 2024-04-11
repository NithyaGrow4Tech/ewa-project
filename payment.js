const express = require('express');
const router = express.Router();
const axios = require('axios');
const store = require('store');
const sha256 = require('sha256');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv')
dotenv.config({ path: "config.env" })
router.get('/', async function (req, res, next) {
    res.json('Please Pay & Repond From The Payment Gateway Will Come In This Section');
});
router.get('/pay', async function (req, res, next) {
    //Store IT IN DB ALSO
    let tx_uuid = uuidv4();
    store.set('uuid', { tx: tx_uuid });
    let paymentPayLoad = {
        "merchantId": process.env.MERCHANT_ID,
        "merchantTransactionId": tx_uuid,
        "merchantUserId": "MUID123",
        "amount": 10000,
        redirectUrl: `${process.env.BASE_URL}/api/v1/register/redirect`,
        redirectMode: "POST",
        callbackUrl: `${process.env.BASE_URL}/api/v1/register/callback`,
        "mobileNumber": process.env.mobileNumber,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }
    let saltKey = process.env.SALT_KEY
    let saltIndex = 1
    let bufferObj = Buffer.from(JSON.stringify(paymentPayLoad), "utf8");
    let base64String = bufferObj.toString("base64");

    let string = base64String + '/pg/v1/pay' + saltKey;
    let sha256_val = sha256(string);
    let checksum = sha256_val + '###' + saltIndex;
    console.log(checksum);
    axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
        'request': base64String
    }, {
        headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'accept': 'application/json'
        }
    }).then(function (response) {
        console.log("res: ", response.data)
        res.status(200).send((response.data.data).toString())
        // .redirect(response.data.data.instrumentResponse.redirectInfo.url);
    }).catch(function (error) {
        console.log("error");
    });
});
//PAY RETURN
router.all('/pay-return-url', async function (req, res) {
    if (req.body.code == 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {

        // ! check the amount, merchatnId, check transsactionId == uuid.tx
        if (req.body.transactionId) {
            let saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
            let saltIndex = 1
            let surl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT/' + req.body.transactionId;
            let string = '/pg/v1/status/PGTESTPAYUAT/' + req.body.transactionId + saltKey;
            let sha256_val = sha256(string);
            let checksum = sha256_val + '###' + saltIndex;

            axios.get(surl, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': req.body.transactionId,
                    'accept': 'application/json'
                }
            }).then(function (response) {
                res.send(response.data)
                console.log(response);
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            console.log("error 1");
        }
    } else {
        console.log("error 2");
    }
});
module.exports = router;