document.addEventListener('DOMContentLoaded', () => {
	if (window.ApplePaySession) {
		showApplePayButton();
    }
});


/** Este método deve ser executado quando a página de checkout for carregada. */
function showApplePayButton() {
    if (ApplePaySession.canMakePayments) {
        HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
        const buttons = document.getElementsByClassName("apple-pay-button");
        for (let button of buttons) {
            button.className += " visible";
        }
    }
}

function startPaymentProcess(paymentRequest, maxipagoAdditionalPaymentData) {
	
	const session = new ApplePaySession(1, paymentRequest);
		
	/** Validação do Merchant Apple, através do endpoint maxiPago. */
	session.onvalidatemerchant = (event) => {
		console.log("Validate merchant");
		getApplePaySession(event.validationURL, maxipagoAdditionalPaymentData).then(function(response) {
  			console.log(response);
  			session.completeMerchantValidation(response);
		});
	};

	session.onshippingmethodselected = (event) => {
		const shippingCost = event.shippingMethod.identifier === 'free' ? '0.00' : '5.00';
		const totalCost = event.shippingMethod.identifier === 'free' ? '8.99' : '13.99';
		var e = document.getElementById("parcelamento");
		var qtd_parcelas = e.options[e.selectedIndex].value;
		
		const lineItems = [
			{
				label: 'Shipping',
				amount: shippingCost,
			},     
			{
	            label: qtd_parcelas+'x',
	            amount: '4.95',
	          }
		];

		const total = {
			label: 'Apple Pay Example',
			amount: totalCost,
		};

		session.completeShippingMethodSelection(ApplePaySession.STATUS_SUCCESS, total, lineItems);
	};

	/** Processamento da autorização recebida do Apple Pay. */
    session.onpaymentauthorized = (event) => {
        console.log("onpaymentauthorized");   
        var e = document.getElementById("parcelamento");
        var qtd_parcelas = e.options[e.selectedIndex].value;
        const payment = event.payment;
        processPaymentOrder(payment.token, maxipagoAdditionalPaymentData).then(function(response) {
            console.log("response from maxipago! received");
            console.log(response);

            if(response.match(/status=.error./)) {
                console.log("an error occured!");
                console.log(response);
                return session.abort();
            }

            session.completePayment(ApplePaySession.STATUS_SUCCESS);
            alert("Payment succeeded");
        });
    

    };

    console.log("start Apple Pay payment");
    session.begin();
}

function getApplePaySession(url, maxipagoAdditionalPaymentData){
    return new Promise(function (resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '//testapi.maxipago.net/UniversalAPI/rest/EncryptedWallet/authentication');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
                console.log("...metodo EncryptedWalled/authentication retornou SUCESSO");
            } else {
                console.log("...metodo EncryptedWalled/authentication retornou ERRO");
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            console.log(this.status);
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        console.log("url - validation:"+url);
        xhr.setRequestHeader("Content-Type", "application/json");
        var request = 
          	  '{"wallet": "applePay",'+
          	  	'"walletDetail": {'+
          	      '"merchantIdentifier":"'+maxipagoAdditionalPaymentData.merchantIdentifier+'",'+ 
          	      '"domainName":"'+maxipagoAdditionalPaymentData.domainName+'",'+
          	      '"displayName":"'+maxipagoAdditionalPaymentData.domainName+'",'+
          	      '"validationURL":"'+url+'"'+
          	     '}'+
              '}';
        console.log("Request apple session:"+request);
        xhr.send(request);
    });
}

function processPaymentOrder(token, maxipagoAdditionalPaymentData) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '//testapi.maxipago.net/UniversalAPI/rest/EncryptedWallet/order');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                console.log("...metodo EncryptedWalled/order retornou SUCESSO");                
                resolve(xhr.response);
            } else {
                console.log("...metodo EncryptedWalled/order retornou ERRO");                                
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.setRequestHeader("Content-Type", "application/json");
       
        var maxiPagoAdditionalData =
        '{"wallet":"applePay", '+
        '"referenceNumber":"'+maxipagoAdditionalPaymentData.referenceNumber+'",' +
        '"installments":"'+maxipagoAdditionalPaymentData.installments+'",' +
        '"walletDetail": {' +
        '"merchantIdentifier":"'+maxipagoAdditionalPaymentData.merchantIdentifier+'",' +
        '"transactionType":"'+maxipagoAdditionalPaymentData.transactionType+'",';
        
        if (maxipagoAdditionalPaymentData.transactionType == "recurringPayment"){ // As tags de recorrência são enviadas
        																		 //	 apenas em caso de pagamento recorrente
	        maxiPagoAdditionalData = maxiPagoAdditionalData +
		    '"recurring":{' +  
		         '"action":"new",'+
		         '"startDate":"2018-10-05",'+
		         '"period":"monthly",'+
		         '"frequency":"1",'+
		         '"installments":"12",'+
		         '"firstAmount":"100",'+
		         '"lastAmount":"1000",'+
		         '"lastDate":"2019-10-05",'+
		         '"failureThreshold":"1"'+
		    '"},"';
        }
        
        maxiPagoAdditionalData = maxiPagoAdditionalData +'"applePayPayment":' ;
        paymentToken = JSON.stringify(token);
        var paymentTokenFormatted = maxiPagoAdditionalData+paymentToken+" }" +"}";
        console.log(paymentTokenFormatted);
        xhr.send(paymentTokenFormatted);
    });
  }