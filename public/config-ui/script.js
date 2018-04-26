'use strict';
(function() {
  let configPath = '';
  let config = {};
  let configList = [];
  function init() {
    configPath = window.location.pathname.replace('config/ui', 'config');
    document.getElementById('main-config').onsubmit = (event) => {
      event.preventDefault();
      let submitButton = document.getElementById('submit-button');
      submitButton.disabled = true;
      fetch(`http://${window.location.host}${configPath}`, {
        body: JSON.stringify(config),
        headers: {'content-type': 'application/json'},
        method: 'POST',
      }).then((response) => response.json())
        .then((json) => {
          alert(`${json.set} values set, ${json.unset} values not set.`);
          configList.forEach((configItem) => {
            let input = document.getElementById(`${configItem.name}-input`);
            if (json.config[configItem.name]) {
              config[configItem.name] = json.config[configItem.name];
              input.value = configItem.type === 'string'? config[configItem.name] : JSON.stringify(config[configItem.name]);
            } else {
              delete config[configItem.name];
              input.value = '';
            }
          });
          submitButton.disabled = false;
        });
    };
    let fetchConfig = fetch(`http://${window.location.host}${configPath}`)
      .then((response) => response.json())
      .then((configJSON) => config = configJSON);
    let fetchConfigList = fetch(`http://${window.location.host}${configPath}list`)
      .then((response) => response.json())
      .then((configListJSON) => configList = configListJSON);

    function inputValidator(input, configItem) {
      return () => {
        let value;
        try {
          switch (String(configItem.type)) {
          case 'number':
            value = parseFloat(input.value);
            break;
          case 'object':
            value = JSON.parse(input.value);
            if (typeof value !== 'object') value = null;
            break;
          default:
            value = input.value;
          }
        } catch (e) {
          value = null
          ;
        }
        if ((!value && input.value.length > 0) || (value && !configItem.validator(value))) {
          delete config[configItem.name];
          input.setCustomValidity('Invalid field');
          return;
        }
        config[configItem.name] = value;
        input.setCustomValidity('');
      };
    }
    Promise.all([fetchConfig, fetchConfigList]).then(() => {
      configList.forEach((configItem) => {
        configItem.validator = eval(configItem.validatorString);
        let input = document.getElementById(`${configItem.name}-input`);
        if (config[configItem.name]) input.value = configItem.type === 'string'? config[configItem.name] : JSON.stringify(config[configItem.name]);
        input.addEventListener('input', inputValidator(input, configItem));
      });
    });
  }
  init();
})();
