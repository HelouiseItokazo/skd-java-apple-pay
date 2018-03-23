/**
 * Cria uma requisição de pagamento, contendo valor e opções de entrega, e envia
 * a maxiPago.
 */
function applePayButtonClicked() {
	var e = document.getElementById("parcelamento");
	var qtd_parcelas = e.options[e.selectedIndex].value;
	const
	paymentRequest = {
		countryCode : 'US',
		currencyCode : 'USD',
		shippingMethods : [ {
			label : 'Free Shipping',
			amount : '0.00',
			identifier : 'free',
			detail : 'Delivers in five business days',
		}, {
			label : 'Express Shipping',
			amount : '5.00',
			identifier : 'express',
			detail : 'Delivers in two business days',
		}, ],

		lineItems : [ {
			label : 'Shipping',
			amount : '0.00',
		}, {
			label : qtd_parcelas + 'x',
			amount : '4.95',
		} ],

		total : {
			label : 'Apple Pay Example',
			amount : '8.99',
		},

		supportedNetworks : [ 'masterCard', 'visa' ],
		merchantCapabilities : [ 'supports3DS' ],

		requiredShippingContactFields : [ 'postalAddress', 'email' ],
	};

	const maxipagoAdditionalPaymentData = {
		  referenceNumber : 'MAXIPAGO-TEST',
	      installments :  qtd_parcelas,
	      chargeInterest: 'N',
	      merchantIdentifier : 'merchant.teste.renan.com',
		  domainName : 'testapi.maxipago.net',
		  displayName : 'your display name',
		  transactionType : 'auth', // Este pode ser "auth", "sale" or "recurringPayment".
		  
	};

	startPaymentProcess(paymentRequest, maxipagoAdditionalPaymentData);
}