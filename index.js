function numHandleChange(e) {
  console.log(document.getElementById(`*${e.target.name}`))
  let inputVal = document.getElementById(e.target.name)
  var regex = /^([1-9]\d*|0)(\.\d+)?$/g
  if (!e.target.value.match(regex)) {
      inputVal.setCustomValidity(`Invalid input for ${document.getElementById(`*${e.target.name}`).innerText}`)
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
  console.log(e.target.value)
  state = e.target.value
  const stateInfo = document.getElementById('state-tax')
  const myHeaders = new Headers()
  myHeaders.append(
    'Authorization',
    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBUElfS0VZX01BTkFHRVIiLCJodHRwOi8vdGF4ZWUuaW8vdXNlcl9pZCI6IjVlODM1NzU2ZjEyNWY2MTQ3MmMyM2EyNyIsImh0dHA6Ly90YXhlZS5pby9zY29wZXMiOlsiYXBpIl0sImlhdCI6MTU4NTY2NTg3OH0.vsbJoLxS5IOw01bgs6wuVOcwZVjOfgmBGRBqq8dRlYg'
  )

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  }

  fetch(`https://taxee.io/api/v2/state/${year}/${state}`, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      taxObj = JSON.parse(result)
      console.log(JSON.parse(result))
      if (!(taxObj.single.type === 'none')) {
        console.log('state tax')
        stateInfo.style = 'display: block'
      }else if (taxObj.single.type === 'none') {
        stateInfo.style = 'display: none'
            }
    })
    .catch((error) => console.log('error', error))
}

function displayRes(resObj) {
  for (const property in resObj) {
    for (const key in property) {
      document.getElementById(`${property}-${key}`)
    }
  }
}

async function onSubmit(e) {
  e.preventDefault()
  let socialSec = 0
  let medicare = 0
  const payFrequency = document.getElementById('freq').value
  const grossInput = document.getElementById('pay').value
  if (+grossInput > 137700) {
    socialSec = 8537.40
  }else {
    socialSec = +grossInput * 0.062
  }
  if (+grossInput > 200000) {
    let addMedic = (+grossInput - 200000) * 0.154
    medicare = 2900 + addMedic
  } else {
    medicare = +grossInput * 0.0145
  }
  let myHeaders = new Headers()
  myHeaders.append(
    'Authorization',
    ''
  )
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  var urlencoded = new URLSearchParams()
  urlencoded.append('pay_rate', grossInput)
  urlencoded.append('filing_status', document.getElementById('fed-stat').value)
  urlencoded.append('state', state)
  urlencoded.append('pay_periods', document.getElementById('freq').value)
  urlencoded.append('exemptions', document.getElementById('fed-allow').value)

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  }

  fetch('https://taxee.io/api/v2/calculate/2020', requestOptions)
    .then((response) => response.text())
    .then(result => {
      const res = JSON.parse(result)
      res.annual.social = {amount: socialSec}
      res.annual.medicare = {amount: medicare}
      let annualDeductions = 0
      for (const key in res.annual) {
        annualDeductions += res.annual[key].amount 
      }
      res.annual.net = {amount: +grossInput - annualDeductions}
      res.per_pay_period.social = {amount: socialSec / payFrequency}
      res.per_pay_period.medicare = {amount: medicare / payFrequency}
      let periodDeductions = 0
      for (const key in res.per_pay_period) {
        periodDeductions += res.per_pay_period[key].amount
      }
      res.per_pay_period.net = {amount: (+grossInput / payFrequency) - periodDeductions}
      // displayRes(result)
      console.log(res)
    })
    .catch((error) => console.log('error', error))
}