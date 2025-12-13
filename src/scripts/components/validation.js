// Показывает ошибку при невалидном инпуте
const showInputError = (formElement, inputElement, inputErrorClass, errorMessage, errorClass) => {
   const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
   inputElement.classList.add(inputErrorClass)
   errorElement.textContent = errorMessage;
   errorElement.classList.add(errorClass);
}

// Прячет ошибку при валидном инпуте
const hideInputError = (formElement, inputElement, inputErrorClass, errorClass) => {
   const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
   inputElement.classList.remove(inputErrorClass)
   errorElement.textContent = '';
   errorElement.classList.remove(errorClass);
}

// Проверяет инпут на валидность
const checkInputValidity = (formElement, inputElement, inputErrorClass, errorClass) => {
   inputElement.validity.patternMismatch ? inputElement.setCustomValidity(inputElement.dataset.errorMessage)
   : inputElement.setCustomValidity(""); 
   !inputElement.validity.valid ? showInputError(formElement, inputElement , inputErrorClass, inputElement.validationMessage, errorClass): hideInputError(formElement, inputElement, inputErrorClass, errorClass);
}

// Проверяет валидны ли оба инпута одновременно
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  })
}; 

// Отключает кнопку отправки при невалидном инпуте
const disableSubmitButton = (submitButton, inactiveButtonClass) => {
   submitButton.classList.add(inactiveButtonClass)
   submitButton.setAttribute('disabled', true)
}

// Включает кнопку отправки при валидном инпуте
const enableSubmitButton = (submitButton, inactiveButtonClass) => {
   submitButton.classList.remove(inactiveButtonClass)
   submitButton.removeAttribute('disabled')
}

// Переключает состояние кнопки активна/неактивна при валидном/невалидном инпуте
const toggleButtonState = (inputList, submitButton, inactiveButtonClass) => {
   hasInvalidInput(inputList) ? disableSubmitButton(submitButton, inactiveButtonClass) : enableSubmitButton(submitButton, inactiveButtonClass)
}

// Навешивает на инпуты слушатель событий
const setEventListeners = (formElement, inputSelector, inputErrorClass, errorClass, submitButton, inactiveButtonClass) => {
   const inputList = Array.from(formElement.querySelectorAll(inputSelector));
   toggleButtonState(inputList, submitButton, inactiveButtonClass);
   inputList.forEach((inputElement) => {
      inputElement.addEventListener("input", () => {
         checkInputValidity(formElement, inputElement, inputErrorClass, errorClass)
         toggleButtonState(inputList, submitButton, inactiveButtonClass)
      })
   })
}

// Включает валидацию форм, на вход принимает параметры формы
export const enableValidation = (validationSettings) => {
   const {formSelector, inputSelector, submitButtonSelector, inactiveButtonClass, inputErrorClass, errorClass} = validationSettings;
   const formList = Array.from(document.querySelectorAll(formSelector));
   
   formList.forEach((formElement) => {
      const submitButton = formElement.querySelector(submitButtonSelector);
      const inputList = Array.from(formElement.querySelectorAll(inputSelector));
      toggleButtonState(inputList, submitButton, inactiveButtonClass);
      setEventListeners(formElement, inputSelector, inputErrorClass, errorClass, submitButton, inactiveButtonClass);
   });
}

// Отключает валидацию форм
export const clearValidation = (formElement, validationSettings) => {
   const {_, inputSelector, submitButtonSelector, inactiveButtonClass, inputErrorClass, errorClass} = validationSettings;
   const submitButton = document.querySelector(submitButtonSelector)
   const inputList = Array.from(formElement.querySelectorAll(inputSelector));
   disableSubmitButton(submitButton, inactiveButtonClass)
   inputList.forEach((inputElement) => {
      hideInputError(formElement, inputElement, inputErrorClass, errorClass)
      disableSubmitButton(submitButton, inactiveButtonClass)
   })

   toggleButtonState(inputList, submitButton, inactiveButtonClass);
}