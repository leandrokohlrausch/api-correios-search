'use strict';

const request = require('request');
const cheerio = require('cheerio');

const urlRequestByAddress = "http://www.buscacep.correios.com.br/sistemas/buscacep/resultadoBuscaCep.cfm";
const urlRequestByCEP = "http://www.buscacep.correios.com.br/sistemas/buscacep/resultadoBuscaEndereco.cfm"

const _buildParamsByRequest = (req) => {
  let zipcode = req.param('zipcode') || null;
  if (zipcode) return { CEP : zipcode };
  let street = req.param('street') || "";
  let city = req.param('city') || "";
  let number = req.param('number') || "";
  let state = req.param('state') || "";
  let data = {
    Logradouro : street,
    UF : state,
    Localidade : city,
    Numero : number
  };
  return _treatPaginateResult(_getPageResult(req), data);
};

const _treatPaginateResult = (nextPage, data) => {
	let pagini = 1;
	let pagfim =  50;
	let qtdrow = 50;
	pagini = ((nextPage * qtdrow) + 1);
	pagfim = pagini + (qtdrow - 1);
	data.pagini = pagini;
	data.pagfim = pagfim;
	data.qtdrow = qtdrow;
	return data;
};

const _getPageResult = (req) => {
	let nextPage = req.param('nextPage') || 0;
	if (/\D/.test(nextPage)) {
		nextPage = 0;
	}
	return nextPage;
};

const _treatSuccessReturn = (body, req) => {
	let $ = cheerio.load(body);
	let result = [];
	$('.tmptabela tr').each((i, tr) => {
		let data = {};
		$('td', $(tr)).each((x, td) => {
            let value = $(td).text().trim();
			if (x == 0) {
				data.street = value;
			} else if (x == 1) {
				data.district = value;
			} else if (x == 2) {
				data.city = value;
			} else {
				data.zipcode = value;
			}
		});

		if (Object.keys(data).length > 0 ) {
			result.push(data);
		}
	});
	return { results: result, currentPage: _getPageResult(req)};
};

const _getUrlRequest = (req) => {
	let zipcode = req.param('zipcode') || null;
	return zipcode ? urlRequestByCEP : urlRequestByAddress;
};

const _validateParamsRequest = (params) => {
	if (params.CEP && params.CEP.length > 0) {
		 if(/\D/.test(params.CEP)) {
		 	return 'Field zipcode not Valid number(Only numbers)';
		 } else {
			return null;
		 }
	} else {
		let states = ['AC','AL', 'AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
		if (!params.UF || states.indexOf(params.UF) <= -1) {
			return `Field state not valid. Valid values -> ${states}`;
		}

        if (!params.Logradouro || params.Logradouro.length < 1) {
			return 'Field street cannot be blank';
		}

        if (!params.Localidade || params.Localidade.length < 1) {
			return 'Field city cannot be blank';
		}

		if (params.Numero) {
			if(/\D/.test(params.Numero)) {
		 		return 'Field number not Valid number(Only numbers)';
		 	} else {
				return null;
			}
		}
	}
};

const _setCorsResponseAcceptHeaders = (res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, x-requested-by, Content-Type, Accept');
};

module.exports = {

    findInfoAddressByParams : (req, res) => {
        let params = _buildParamsByRequest(req);
        let message =_validateParamsRequest(params);
        _setCorsResponseAcceptHeaders(res);

        if (message) return res.status(400).json({ message: message });

        request.post(_getUrlRequest(req), { form: params, timeout: 10000 }, (error, response, body) => {
            if (error) return res.status(400).json({ message : `ERROR -> ${error}` });
            res.status(200).json(_treatSuccessReturn(body, req));
        });
    },


    index : (req, res) => {
        res.render('index.ejs');
    }

};
