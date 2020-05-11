function numHandleChange(e) {
  let inputVal = document.getElementById(e.target.name)
  let regex = /^([1-9]\d*|0)(\.\d+)?$/g
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
let count = 1
let onlyCheckbox

function addWithholding(e) {
  let isChecked = document.getElementById('fed-with-check').checked

  if (count === 1) {
    onlyCheckbox = document.getElementById('fed-withs-cont').innerHTML
  }
  e.preventDefault()

  const container = document.getElementById('fed-withs-cont')
  const newForm = `<div \
      id='fed-with-form-${count}' \
      class='fed-with-form fed-${count}' \
      style='margin-top: 5px;'> \
      <h3 style='margin-top: 5px;'>Additional Federal Withholding ${count}</h3> \
      <div class='form-line'> \
        <label for='add-fed-name'>Withholding Name</label> \
        <div> \
          <input \
            form='fed-form' \
            required \
            type='text' \
            id='add-fed-name-${count}' \
          /> \
        </div> \
      </div> \
      <div class='form-line'> \
        <label for='add-fed'>Withholding Amount</label> \
        <div class='dollar'> \
          <input \
            form='fed-form' \
            required \
            name='fed-with-amount-${count}' \
            type='text' \
            id='fed-with-amount-${count}' \
            onkeyup='numHandleChange(event)' \
          /> \
        </div> \
      </div> \
      <div class="form-line"> \
          <label for="fed-method">Amount Frequency</label> \
          <select \
          form="fed-form" \
            name="pay-method" \
            id="fed-method" \
            style="overflow: hidden !important; width: 150px;" \
          > \
            <option value="annual">Annually</option> \
            <option value="perPeriod">Pay Per Period</option> \
          </select> \
        </div> \
      <div class='form-line checkbox'> \
        <label class='info' for='pre-tax-fed'> \
          Pre-Tax Withholding \
        </label> \
        <input form='fed-form' type='checkbox' id='pre-tax-fed-${count}'/> \
        <label class='check' for='pre-tax-fed-${count}'></label> \
      </div> \
      
      <button \
        id='fed-button-${count}'
        class='fed-button' \
        form='fed-form' \
        style='align-self: center; display: ${
          count === count ? 'block' : 'none'
        }' \
        onclick='addWithholding(event)'> \
        Add \
      </button> \
      <button 
      style='display:${count === 1 ? 'none' : 'block'}'
      onclick="removeWithholding(event)"
      >
      Remove
      </button>
    </div>`
  if (isChecked) {
    if (count > 1) {
      document.getElementById(`fed-button-${count - 1}`).style =
        'align-self: center; display: none'
    }
    container.insertAdjacentHTML('beforeend', newForm)
    count++
  } else {
    container.innerHTML = onlyCheckbox
    count = 1
  }
}

function removeWithholding(e) {
  e.preventDefault()
  document.getElementById(e.target.parentNode.id).remove()
  count--
}

function getWithholdings() {
  const fedWithsArr = document.getElementsByClassName('fed-with-form')
  let preTax = []
  let postTax = []
  for (let i = 0; i < fedWithsArr.length; i++) {
    console.log(fedWithsArr[i].querySelectorAll('input, select'))
    let inputs = fedWithsArr[i].querySelectorAll('input, select')
    if (inputs[3].checked === true) {
      preTax.push({
        name: inputs[0].value,
        amount: +inputs[1].value,
        frequency: inputs[2].value,
        preTax: inputs[3].checked,
      })
    } else {
      postTax.push({
        name: inputs[0].value,
        amount: +inputs[1].value,
        frequency: inputs[2].value,
        preTax: inputs[3].checked,
      })
    }
  }
  return {
    preTax,
    postTax,
  }
}

function displayRes(resObj) {
  console.log(resObj)

  Object.keys(resObj).forEach((loc) => {
    Object.keys(resObj[loc]).forEach((key) => {
      if (key === 'preWiths' || key === 'postWiths') {
        let withElement = document.getElementById(`${key}`)
        loc.key.forEach((withhold, i) => {
          withElement.appendChild(`<div class="res-line">
        <h4>${withhold.name} -</h4>
        <p id="annual-federal">${withhold.amount}</p>
      </div>`)
        })
      } else {
        console.log(resObj[loc], key)
        let dispLine = document.getElementById(`${loc}-${key}`)
        
        dispLine.innerText = `$${resObj[loc][key].amount.toFixed(2)}`
      }
    })
  })
  const results = document.getElementById('results')
  const inputs = document.getElementById('main-container')
  inputs.style = 'display: none'
  results.style = 'display: flex'
}

async function onSubmit(e) {
  e.preventDefault()
  const fedWithholdings = getWithholdings()
  console.log(fedWithholdings)

  let socialSec = 0
  let medicare = 0
  let payFrequency = document.getElementById('freq').value
  let grossInput = +document.getElementById('pay').value
  let method = document.getElementById('method').value
  // let exemptions = document.getElementById('fed-allow').value
  const fedExempt = document.getElementById('ex-fed').checked
  const socExempt = document.getElementById('ex-soc').checked
  const medExempt = document.getElementById('ex-med').checked
  const stateExempt = document.getElementById('ex-state').checked

  if (!payFrequency || !grossInput || !method || !state) {
    return alert('Please fill out required fields.')
  }
  let preFedWithTotal = 0
  let postFedWithTotal = 0
  const annPreTax = fedWithholdings.preTax.map((WH) => {
    if (WH.frequency === 'perPeriod') {
      return { ...WH, amount: WH.amount * payFrequency }
    } else {
      return WH
    }
  })
  // const annPreTax = fedWithholdings.preTax.filter(
  //   (WH) => WH.frequency === 'annual'
  // )
  const annPostTax = fedWithholdings.postTax.map((WH) => {
    if (WH.frequency === 'perPeriod') {
      return { ...WH, amount: WH.amount * payFrequency }
    } else {
      return WH
    }
  })
  if (fedWithholdings.lenght > 0) {
    preFedWithTotal = annPreTax.reduce((acc, WH) => {
      acc + WH.amount
    }, 0)
    postFedWithTotal = annPostTax.reduce((acc, WH) => {
      acc + WH.amount
    }, 0)
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
    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBUElfS0VZX01BTkFHRVIiLCJodHRwOi8vdGF4ZWUuaW8vdXNlcl9pZCI6IjVlODM1NzU2ZjEyNWY2MTQ3MmMyM2EyNyIsImh0dHA6Ly90YXhlZS5pby9zY29wZXMiOlsiYXBpIl0sImlhdCI6MTU4NzQ0NDUyN30.hHuqcLhdd5JObKHvbQhMNNGetoILQcWpxOXMdxZ2_HE'
  )
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  var urlencoded = new URLSearchParams()
  urlencoded.append('pay_rate', (grossInput - preFedWithTotal) / payFrequency)
  urlencoded.append('filing_status', document.getElementById('fed-stat').value)
  urlencoded.append('state', state)
  urlencoded.append('pay_periods', payFrequency)

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
      res.annual.postFedWithTotal = {amount: postFedWithTotal}
      res.annual.federal.amount = fedExempt ? 0 : res.annual.federal.amount
      res.annual.state.amount = stateExempt ? 0 : res.annual.state.amount
      res.annual.social = { amount: socExempt ? 0 : socialSec }
      res.annual.medicare = { amount: medExempt ? 0 : medicare }
      res.annual.fica.amount =
        res.annual.social.amount + res.annual.medicare.amount
      for (const key in res.annual) {
        if (key === 'fica') continue
        else annualDeductions += res.annual[key].amount
      }
      res.annual.gross = { amount: grossInput }
      res.annual.preWiths = annPreTax
      res.annual.taxableGross = {amount: grossInput - preFedWithTotal}
      res.annual.postWiths = annPostTax

      res.annual.net = { amount: grossInput - annualDeductions }
      let periodDeductions = 0
      res.per_pay_period.social = {
        amount: socExempt ? 0 : socialSec / payFrequency,
      }
      res.per_pay_period.medicare = {
        amount: medExempt ? 0 : medicare / payFrequency,
      }
      res.per_pay_period.state.amount = stateExempt
        ? 0
        : res.per_pay_period.state.amount
      res.per_pay_period.federal.amount = fedExempt
        ? 0
        : res.per_pay_period.federal.amount
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
