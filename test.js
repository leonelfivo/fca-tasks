/*
* DEPENDENCES
*/
var Cron 		= require('node-schedule');
var Database 	= require('./services/OracleConnectorHelper.js');
var XLSX 		= require('./services/XLSXHelper.js');

console.log('-> Starting new export proccess.');	

// Execute query, generate report and send Email
Database.getStream(theQuery(), function(err,stream) {	
	if(!err) {
		XLSX.generate(stream);
	}	
});


function theQuery() {
	return "select ds.code as anagrafico, grg.name as REGIAO, rg.name as REGIONAL, sc.name as SETOR, gp.name as GRUPO, ds.name as CONCESSIONARIA, b.NAME AS MARCA, v.name as MODELO, "
	+ "to_char(dfv.DAILY_FLOW_DATE, 'YYYY') AS ANO,to_char(dfv.DAILY_FLOW_DATE, 'MM') AS MES,to_char(dfv.DAILY_FLOW_DATE, 'DD') AS DIA, "
	+ "dfv.STORE_ENTRIES as VISITAS, dfv.ATTENDANCES AS ATENDIMENTOS, dfv.OFFERED_TEST_DRIVES AS TEST_DRIVES_OFERECIDOS, dfv.PERFORMED_TEST_DRIVES AS TEST_DRIVES_REALIZADOS, dfv.FIRMED_ORDERS AS VENDAS from DAILY_FLOW_VEHICLES dfv "
	+ "inner join groups ds on ds.ID=dfv.DAILY_FLOW_DEALERSHIP_ID "
	+ "inner join groups gp on gp.id=ds.superior_id "
	+ "inner join groups sc on sc.id=gp.superior_id "
	+ "inner join groups rg on rg.id=sc.superior_id "
	+ "inner join groups grg on grg.id=rg.superior_id "
	+ "inner join DEALERSHIP_BRANDS dsb on dsb.DEALERSHIP_ID=dfv.DAILY_FLOW_DEALERSHIP_ID "
	+ "inner join vehicles v on v.id=dfv.VEHICLE_ID "
	+ "inner join brands b on b.ID=dsb.BRAND_ID "
	+ "order by dfv.DAILY_FLOW_DATE desc";
}