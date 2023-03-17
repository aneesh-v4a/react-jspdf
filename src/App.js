import { makePdf } from './utils/PdfMaker';

function App() {
  
const obj = {
  vendorNumber:
  "123456", 
  vendorName: "My vendor", 
  paymentNumber: '12468',
  paymentDate: "03/03/2023", 
  paymentAmount: "14693.61",
  mailCode: "W",
}

const dataList = Array.from({length: 100}, () => obj);

const pageHeader = {

  headerObj: [
    {position: 'l', data: ['Main 1', 'Sub head 1', 'Sub head 2']},
    {position: 'r', data: [`Payment Date 3/12/2023`, 'Batch B1234']},
    // {position: 'c', data: [`Payment Date 3/12/2023`, 'Batch B1234']}
  ],
  
  headerText: {
    text: 'Account 1234 QA Payment',
    position: 'c'
  },
  // headerImage: {}
  // headerImage not implemented
}

const keyMap = {
  keyList: ['vendorNumber', 'vendorName','paymentNumber' ,'paymentDate', 'paymentAmount', 'mailCode'],
  isOrdered: true
  // list of keys to be shown in the table
  // if isOrdered is false then the keys will be sorted in ascending order.
}

const pdfConfig = {}

const tableConfig = {
  title: 'Account 1234 QA Payment',
  findSum: true,
  sumKey: 'paymentAmount' // this key in the data is used to find sum
}

// makePdf(dataList, keyMap, pageHeader, pdfConfig, tableConfig )

  return (
    <div className="App">
      <button onClick={e => makePdf(dataList, keyMap, pageHeader, pdfConfig, tableConfig)}>Print Now</button>
    </div>
  );
}

export default App;
