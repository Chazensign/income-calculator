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
