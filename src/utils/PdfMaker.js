import {jsPDF} from "jspdf";
import "jspdf-autotable";
import moment from "moment/moment.js";

/**
 PageHeader = {
   headerImage:{
     position: '', // values : 'l'||'r'||'c'
     image: ''
   },
   headerText: {
     position: '', // values 'l'||'r'||'c'
     text: '',
     size: 5
   },
   headerObj: [] // obj of the form {position:'l'||'r'||'c', data: [] } 
   data-length max 3, data[0] will be bold
  }
  if headerImage.position === headerText.position, then only headerImage will be displayed 
 
 */

const defaultPdfConfig = {
  orientation: 'p',
  unit: 'mm',
}

let timeStamp;

export function makePdf(data, keyMap, pageHeader, pdfConfig, tableConfig){
  if (!data || !keyMap) {
    throw Error('Unable to map data. Check the data and key map.')
  }

  if (!pdfConfig || !(Object.keys(pdfConfig).length)) {
    pdfConfig = {...defaultPdfConfig}
  }
  
  const doc = new jsPDF({...pdfConfig}, 'a4');

  addTableTitle(doc, tableConfig?.title)

  setPdfBody(doc, data, keyMap, pageHeader);

  if (tableConfig?.findSum) {
    if (!tableConfig?.sumKey) {
        throw Error('Sum key not found.')
    }
    insertSum(doc,data, tableConfig?.title, tableConfig?.sumKey);
  }
  
  const fileName = `${pageHeader.headerText.text || tableConfig.title || 'Hyphen - '+new Date().getTime().toString()}.pdf`;
  doc.output('dataurlnewwindow', {filename: fileName});
}

function setHeader(doc, header) {
  
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor('#000000');

  //  TODO: Generate header image

  // Generating Header Object
  if (Array.isArray(header.headerObj) && header.headerObj.length) {
    if (header.headerObj.length > 3) {
      throw Error('You have provided more than 3 header objects.')
    }
    const headerObj = header.headerObj;
    for(let hObj=0; hObj<headerObj.length;hObj++){
      doc.setFontSize(6);
      switch (headerObj[hObj].position) {
        case 'l':
          doc.setFont('helvetica', 'normal', "bold");
          doc.text(headerObj[hObj].data[0] || '', 10, 10, { align: 'left' });
          doc.setFont('helvetica', 'normal');
          doc.text(headerObj[hObj].data[1] || '', 10, 13, { align: 'left' });
          doc.text(headerObj[hObj].data[2] || '', 10, 16, { align: 'left' });
          break;
        case 'r':
          doc.setFont('helvetica', 'normal');
          doc.text(headerObj[hObj].data[0] || '', 170, 10, { align: 'left' });
          doc.text(headerObj[hObj].data[1] || '', 170, 13, { align: 'left' });
          doc.text(headerObj[hObj].data[2] || '', 190, 16, { align: 'right' });
        
          break;
        case 'c':
          doc.setFont('helvetica', 'normal');
          doc.text(headerObj[hObj].data[0] || '', doc.internal.pageSize.width / 2, 10, { align: 'left' });
          doc.text(headerObj[hObj].data[1] || '', doc.internal.pageSize.width / 2, 13, { align: 'left' });
          doc.text(headerObj[hObj].data[2] || '', doc.internal.pageSize.width / 2, 16, { align: 'right' });
          break;
      
        default:
          doc.setFont('helvetica', 'normal', "bold");
          doc.text(headerObj[hObj].data[0] || '', 10, 12, { align: 'left' });
          doc.setFont('helvetica', 'normal');
          doc.text(headerObj[hObj].data[1] || '', 10, 14, { align: 'left' });
          doc.text(headerObj[hObj].data[2] || '', 10, 16, { align: 'left' });
          break;
      }
    }
  }

  // Generating Header text
  if (typeof header.headerText?.text === "string" && header.headerText?.text.length) {
    doc.setFontSize(10);
    switch (header.headerText.position) {
      case 'l':
        doc.text(header.headerText.text, doc.internal.pageSize.width / 2, 10, {align: 'right'})
        break;
      case 'r':
        doc.text(header.headerText.text, doc.internal.pageSize.width / 2, 10, {align: 'left'})
        break;
      case 'c':
        doc.text(header.headerText.text, doc.internal.pageSize.width / 2, 10, {align: 'center'})
        break;
    
      default:
        doc.text(header.headerText.text, doc.internal.pageSize.width / 2, 10, {align: 'center'})
        break;
    }
  }
}

function isEmptyHeader(obj){
  const keys = Object.keys(obj);
  if (!keys.length) {
    return true;
  }
  if (!obj['headerImage']?.image?.length && !obj['headerText']?.text?.length && !obj['headerObj'].length) {
    return true;
  }
  return false;
}

function setPdfBody(doc, data, keyMap, pageHeader) {

  if (pageHeader && !isEmptyHeader(pageHeader)) {
    setHeader(doc, pageHeader);
  }

  const formattedData = getFormattedData(data, keyMap);

  doc.autoTable({
    head: [getHeadersFromKeys(keyMap)], 
    body: formattedData,
    theme: 'plain',
    styles: {
      fontSize:6,
    },
    headStyles: {
      cellPadding: {left: 0, bottom: 5},
      halign: 'start',
      valign: 'end',
    },
    
    margin: {top: 20, bottom: 20, left:10},
    didDrawPage: (data) => {
      setHeader(doc, pageHeader);
    },
    didDrawCell: (data) => {
      
    }
  });
  
  const totalPages = doc.internal.getNumberOfPages();

  doc.internal.pages.forEach((page, i) => {
    const pageString = `Page ${i} of ${totalPages}`;
    doc.setPage(i);
    setFooter(doc, pageString);
  })
}

function setFooter(doc, pageString) {
  timeStamp = moment().format('[Generated on] MM/DD/YYYY [at] hh:MM:ss a');
  doc.setFontSize(5);
  doc.text(timeStamp, 10, 290);
  doc.text(pageString, 190, 290);
}

function getHeadersFromKeys(keyMap){
  if (!keyMap.keyList.length) {
    throw Error('Keylist not provided.')
  }
  const keyList = keyMap.keyList;
  const headers = [];

  keyList.forEach(key =>{
    const keySplit = key.split(/(?=[A-Z])|\W+/);
    const titleKey = keySplit.map(kw => kw.charAt(0).toUpperCase()+kw.slice(1)).join(" ");
    headers.push(titleKey);
  })
  return [...headers]
}

function getFormattedData(data, keyMap) {
  let keyOrder = [...keyMap.keyList];
  if (!keyMap.isOrdered) {
    keyOrder = [...keyMap].sort((k1,k2) => k1>k2)
  }
  const tableData = [];
  data.forEach(d =>{
    const tableRow = [];
    keyOrder.forEach(key =>{
      tableRow.push(d[key])
    });
    tableData.push(tableRow);
  });
  return [...tableData]
}

function addTableTitle(doc, title) {
  doc.line(10,24, 190,24);
  doc.line(10,28, 190,28);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor('#000000');
  doc.text(title || '', 10,27);
}

function insertSum(doc, data, title, sumKey) {
  const finalPage = doc.internal.getNumberOfPages();
  doc.setPage(finalPage);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor('#000000');

  const sum = data.reduce((acc, d) => acc + (typeof d[sumKey] ==='string'? parseFloat(d[sumKey]): d[sumKey]), 0)
  const sumText = `${title.slice(0,12)} Total - ${data.length} Payment    ${sum.toFixed(2)}`;
  const grandTotal = `Grand Total - ${data.length} Payment    ${sum.toFixed(2)}`
  const hOffset = 47 + ((data.length % 41) * 5);
  
  doc.line(10,hOffset, 190,hOffset);
  doc.text(sumText, 165,hOffset+3, {align: 'right'});
  doc.text(grandTotal, 165,hOffset+7, {align: 'right'});
  doc.line(doc.internal.pageSize.width/2,hOffset + 4, 190,hOffset + 4);
}