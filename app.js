const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

//Create CSV file
const writeCSV = fs.createWriteStream('fetchedData.csv');
const app = express();
const PORT = process.env.PORT || 3000;

//URL to list of top companies
const url = 'https://www.ycombinator.com/topcompanies';

try {
  //Get data from page with list of top companies
  axios(url).then(async (res) => {
    const data = await res.data;
    const $ = cheerio.load(data);
    //Create selector for table rows with info about top companies
    const sel = '.top-companies table tbody tr'
    $(sel).each(function () {
      const companyName = $(this).find('.company-name').text()
      const description = $(this).find('.company-overview').text()
      const companyWebsite = $(this).find('.company-website').text()
      const availableJobs = $(this).find('.careers').text()
      //Write data taken from top companies page into created CSV file
      writeCSV.write(`Company Name: ${companyName} | Description: ${description} | Company Website: ${companyWebsite} | Available Jobs: ${availableJobs === 'Apply' ? 'True' : 'False'} \n`)
      //Get data attributes in list of top companies 
      const companyId = $(this).data('companyId')
      //Base URL for details about each company
      const baseUrlForCompanyDetails = 'https://www.ycombinator.com/companies/'
      //Create company link (endpoint - company id from page with list of top companies)
      const companyLink = `${baseUrlForCompanyDetails}` + `${companyId}`
    })
  })
} catch (error) {
  console.log(error, error.message);
}



