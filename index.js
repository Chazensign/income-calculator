function numHandleChange(e) {
  let inputVal = document.getElementById(e.target.name)
  var regex = /^([1-9]\d*|0)(\.\d+)?$/g
  if (!e.target.value.match(regex)) {
    inputVal.setCustomValidity(
      `Invalid input for ${
        document.getElementById(`*${e.target.name}`).innerText
      }`
    )
  } else if (e.target.value.match(regex)) {
    document.getElementById(e.target.name).setCustomValidity('')
  }
}
let taxObj = {}
let state = ''
const date = document.getElementById('datePicker')
let year = date.value.slice(0, 4)

// let pay = document.getElementById('pay').value
async function stateSelected(e) {
  state = e.target.value
  const stateInfo = document.getElementById('state-tax')
  // const myHeaders = new Headers()
  // myHeaders.append(
  //   'Authorization',
  //   ''
  // )

  // var requestOptions = {
  //   method: 'GET',
  //   headers: myHeaders,
  //   redirect: 'follow',
  // }

  // fetch(`https://taxee.io/api/v2/state/${year}/${state}`, requestOptions)
  //   .then((response) => response.text())
  //   .then((result) => {
  //     taxObj = JSON.parse(result)
  //     if (!(taxObj.single.type === 'none')) {
  //       stateInfo.style = 'display: block'
  //     } else if (taxObj.single.type === 'none') {
  //       stateInfo.style = 'display: none'
  //     }
  //   })
  //   .catch((error) => console.log('error', error))
}

function displayRes(resObj) {
  Object.keys(resObj).forEach((loc) => {
    Object.keys(resObj[loc]).forEach((key) => {
      let dispLine = document.getElementById(`${loc}-${key}`)
      dispLine.innerText = `$${resObj[loc][key].amount.toFixed(2)}`
    })
  })
  const results = document.getElementById('results')
  const inputs = document.getElementById('main-container')
  inputs.style = 'display: none'
  results.style = 'display: block'
}

async function onSubmit(e) {
  e.preventDefault()
  let socialSec = 0
  let medicare = 0
  let payFrequency = document.getElementById('freq').value
  let grossInput = +document.getElementById('pay').value
  let method = document.getElementById('method').value
  let exemptions = document.getElementById('fed-allow').value
  const fedExempt = document.getElementById('ex-fed').checked
  const socExempt = document.getElementById('ex-soc').checked
  const medExempt = document.getElementById('ex-med').checked
  const stateExempt = document.getElementById('ex-state').checked
  if (!payFrequency || !grossInput || !method || !state) {
    return alert('Please fill out required fields.')
  }
  if (method === 'perPeriod') {
    grossInput *= payFrequency 
  }
  if (grossInput > 137700) {
    socialSec = 8537.4
  } else {
    socialSec = grossInput * 0.062
  }
  if (+grossInput > 200000) {
    let addMedic = (grossInput - 200000) * 0.154
    medicare = 2900 + addMedic
  } else {
    medicare = grossInput * 0.0145
  }
  let myHeaders = new Headers()
  myHeaders.append(
    'Authorization',
    ''
  )
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  var urlencoded = new URLSearchParams()
  // if (method === 'annual') {
  // } else {
  //   urlencoded.append('pay_rate', grossInput)
  // }
  urlencoded.append('pay_rate', grossInput / payFrequency)
  urlencoded.append('filing_status', document.getElementById('fed-stat').value)
  urlencoded.append('state', state)
  urlencoded.append('pay_periods', payFrequency)
  exemptions ? urlencoded.append('exemptions', exemptions) : null

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  }

  fetch(`https://taxee.io/api/v2/calculate/${year}`, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const res = JSON.parse(result)
      let annualDeductions = 0
      res.annual.federal.amount = fedExempt ? 0 : res.annual.federal.amount
      res.annual.state.amount = stateExempt ? 0 : res.annual.state.amount
      res.annual.social = { amount: socExempt ? 0 : socialSec }
      res.annual.medicare = { amount: medExempt ? 0 : medicare }
      res.annual.fica.amount = res.annual.social.amount + res.annual.medicare.amount
      for (const key in res.annual) {
        if (key === 'fica') continue
        else annualDeductions += res.annual[key].amount
      }
      res.annual.gross = {amount: grossInput}
      res.annual.net = { amount: grossInput - annualDeductions }
      let periodDeductions = 0
      res.per_pay_period.social = {
        amount: socExempt ? 0 : socialSec / payFrequency,
      }
      res.per_pay_period.medicare = {
        amount: medExempt ? 0 : medicare / payFrequency,
      }
      res.per_pay_period.state.amount = stateExempt ? 0 : res.per_pay_period.state.amount
      res.per_pay_period.federal.amount = fedExempt ? 0 : res.per_pay_period.federal.amount
      for (const key in res.per_pay_period) {
        if (key === 'fica') continue
        else periodDeductions += res.per_pay_period[key].amount
      }
      res.per_pay_period.gross = { amount: grossInput / payFrequency }
      res.per_pay_period.fica.amount =
        res.per_pay_period.social.amount + res.per_pay_period.medicare.amount
      res.per_pay_period.net = {
        amount: grossInput / payFrequency - periodDeductions,
      }
      displayRes(res)
    })
    .catch((error) => console.log('error', error))
}
function goBack(e) {
e.preventDefault()
const inputs = document.getElementById('main-container')
const results = document.getElementById('results')
results.style = 'display: none' 
inputs.style = 'display: block'
}
