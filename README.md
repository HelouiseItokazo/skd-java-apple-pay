
Apple Pay JS - maxiPago! SDK
========================

Apple Pay SDK maxiPago! - Pagamentos Apple Pay na Web

## Requisitos

-   [integração maxiPago! completa, para viabilizar estornos, capturas entre outras features: ]
-   [Java 7+, Apache Tomcat 7.0+ ou similar, Mac OS, Safari Browser]

## Instalação

Faça o clone deste projeto. 

Efetue o deploy desta aplicação .war em seu container web **tomcat**

## Inicialização

A integração com o Apple Pay requer a troca dois certificados com a maxiPago, além da criação de um Merchant ID no Apple Member Center [https://developer.apple.com]

- Merchant Identity Certificate: Responsável pela autenticação de seu merchant ID nos servidores da Apple

- Payment Provider Certificate: Responsável por auxiliar o processo de descriptrografia dos dados de pagamento tokenizados com o Apple Pay.

- O Apple Pay necessita que sua execução seja feita sob um ambiente HTTPS e que este domínio seja verificado no Apple Member Center.

A maxiPago! disponibiliza um guia de afiliação completo para o Produto Apple Pay que te auxiliará neste processo de certificação e verificação de domínio, para mais informações, contate um de nossos representantes :) 


### Setup

Nas funções que executam as chamadas à API REST de carteiras da maxiPago!, realize a configuração de seu endpoint para nosso ambiente de integração: 
```javascript
function getApplePaySession(url, maxipagoAdditionalPaymentData){
    return new Promise(function (resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '//testapi.maxipago.net/UniversalAPI/rest/EncryptedWallet/authentication');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
```
```javascript
function processPaymentOrder(token, maxipagoAdditionalPaymentData) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '//testapi.maxipago.net/UniversalAPI/rest/EncryptedWallet/order');
        xhr.onload = function () {
```

**NOTE: Para mover para produção, é necessário alterar o endpoint para: **

Autenticação: //api.maxipago.net/UniversalAPI/rest/EncryptedWallet/authentication 

Order: //api.maxipago.net/UniversalAPI/rest/EncryptedWallet/order


### Fluxo Apple Pay
![alt text](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgQXBwbGUgUGF5IEFwcCAtIEZsdXhvCgpBcHBEb0xvZ2lzdGEgLT4gU2Vydmlkb3IADAk6IHNlbGVjaW9uYXJJdGVucwoAEhEgLT4gADwMOiBpdGVuc0RvQ2FycmluaG8AVREAIA5JbmljaWFyIFBhZ2FtZW50AB4SbWF4aVBhZ29HYXRld2F5OgCBSAZQYXltZW50VG9rZW4Kbm90ZSBvdmVyAIExEiwALhIASQghIEFkZGl0aW9uYWwgRGF0YQplbmQgAEcFCgBmDwCBVBJSZXNwb25zZSBGcm9tAIEUEAAtEgCCFRFub3RpZmljYcOnw6NvIGRvIGF1dGggLyBjYXB0dXJlIAoKCg&s=rose)


## Implementação

Preencher as suas informações de carrinho acumuladas, também pode-se configurar as bandeiras a serem utilizadas e o tipo de segurança: 

supportedNetworks: bandeiras que deseja dar suporte, no momento, a maxiPago! dá suporte à mastercard e visa.

merchantCapabilities: features a serem suportadas, no caso, habilitar o suporte à 3DS: supports3DS.

requiredShippingContactFields : definir quais campos deseja que o preenchimento seja obrigatório

maxipagoAdditionalPaymentData: adicionar os parâmetros adicionais da maxiPago!


## mystore.js
```javascript
paymentRequest = {
		countryCode : 'US', // no ambiente sandbox, deixar como US
		currencyCode : 'USD', // para pagamento em reais, mudar para BRL
		shippingMethods : [ { // pode-se definir métodos de entrega
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

		lineItems : [ { // Line itens são um espaço reservado à descontos, parcelamentos e qualquer outro valor que queira incluir
			label : 'Shipping',
			amount : '0.00',
		}, {
			label : qtd_parcelas + 'x',
			amount : '4.95',
		} ],

		total : { // total da compra, customize para somar os itens de seu carrinho
			label : 'Apple Pay Example',
			amount : '8.99',
		},

		supportedNetworks : [ 'masterCard', 'visa' ],
		merchantCapabilities : [ 'supports3DS' ],
		requiredShippingContactFields : [ 'postalAddress', 'email' ],
	};

	const maxipagoAdditionalPaymentData = {
		  referenceNumber : 'MAXIPAGO-TEST', // seu número de referencia, para localizar a transação de forma mais rápida no portal
	      installments :  qtd_parcelas, // preencher com a quantidade de parcelas, em caso de compras parceladas
	      chargeInterest: 'N', //
	      merchantIdentifier : 'merchant.teste.renan.com', // Seu merchant ID registrado no Apple Developer Center
		  domainName : 'testapi.maxipago.net', // Nome de seu domínio
		  displayName : 'your display name', // Display name
		  transactionType : 'auth', // Este pode ser "auth", "sale" or "recurringPayment".
		  
	};

	startPaymentProcess(paymentRequest, maxipagoAdditionalPaymentData);
```
- NOTE: Esta loja exemplo possui alguns logs para auxilia-lo na depuração, retire os logs antes de rodar em produção.  

## apple_pay_mp.js 

Esta lib contém os métodos que são responsáveis por autenticar o merchant junto à apple, processar o pagamento junto à maxiPago e exibit ou não o botão Apple Pay (o botão será exibido somente no navegador Safari).
