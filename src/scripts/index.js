/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addUserCard, deleteUserCard, changeLikeCardStatus } from "./components/api.js";
import { createCardElement} from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation} from "./components/validation.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardDeleteModalWindow = document.querySelector('.popup_type_remove-card')
const cardDeleteForm = cardDeleteModalWindow.querySelector('.popup__form')
const cardInfoModalWindow = document.querySelector('.popup_type_info');
const cardInfoModalInfoList = document.querySelector('.popup__content_content_info');
const cardInfoItemTemplate = document.querySelector('#popup-info-definition-template')
const cardInfoUsersLikedTemplate = document.querySelector('#popup-info-user-preview-template')

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// Настройки валидации формы
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Включаем валидацию форм
enableValidation(validationSettings)

// Функция для форматирования даты
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
 });

// Открывает изобржаение при нажатии на него
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};
  
// Создание шаблона для информации о карточке
const createInfoString = (title, value) => {
  const infoItem = cardInfoItemTemplate.content
    .querySelector('.popup__info-item')
    .cloneNode(true);

  infoItem.querySelector('.popup__info-term').textContent = title;
  infoItem.querySelector('.popup__info-description').textContent = value;

  return infoItem;
};

// Создание шаблона для информации о пользователях, лайкнувших карточку
const createUsersLikedCard = (user) => {
  const usersLikedCard = cardInfoUsersLikedTemplate.content
    .querySelector('.popup__list-item')
    .cloneNode(true);

  usersLikedCard.textContent = user.name;

  return usersLikedCard;
};

// Вариант 1: показывает информацию о карточке
const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      const popupCardTitle = cardInfoModalInfoList.querySelector('.popup__title')
      const popupCardText = cardInfoModalInfoList.querySelector('.popup__text')
      const popupCardInfo = cardInfoModalInfoList.querySelector('.popup__info')
      const popupCardList = cardInfoModalInfoList.querySelector(".popup__list")

      popupCardTitle.textContent = 'Информация о карточке';
      popupCardText.textContent = 'Лайкнули'

      popupCardInfo.innerHTML = '';
      popupCardList.innerHTML = '';

      popupCardInfo.append(
        createInfoString(
          'Описание: ',
          cardData.name
        )
      );

      popupCardInfo.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );

      popupCardInfo.append(
        createInfoString(
          "Владелец:",
          cardData.owner.name
        )
      );

      popupCardInfo.append(
        createInfoString(
          "Количество лайков:",
          cardData.likes.length
        )
      );
      
      if (cardData.likes.length > 0) {
        cardData.likes.forEach((user) => {
          popupCardList.append(createUsersLikedCard(user));
        });
      } else {
        popupCardList.append('Пока никто не лайкнул');
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Удаление карточки
const handleDeleteCard = (cardElement, cardId) => {
  openModalWindow(cardDeleteModalWindow)
  cardDeleteForm.addEventListener('submit', (evt) => {
    evt.preventDefault()
    cardDeleteForm.querySelector('.popup__button').textContent = 'Удаление...'
    deleteUserCard(cardId)
    .then((response) => {
      console.log(response.message);
      cardElement.remove();
      closeModalWindow(cardDeleteModalWindow)
    })
    .catch((err) => {
      console.log(`Ошибка при удалении карточки: ${err}`);
    })
    .finally(() => {
      cardDeleteForm.querySelector('.popup__button').textContent = 'Да'
    })
  })
};

// Функция изменение состояние кнопки лайка
const handleLikeCard = (cardElement, cardId) => {
  const isCardLiked = cardElement.classList.contains('card__like-button_is-active')
  changeLikeCardStatus(cardId, isCardLiked)
  .then((response) => {
    cardElement.parentElement.querySelector('.card__like-count').textContent = response.likes.length || '';
    cardElement.classList.toggle('card__like-button_is-active')
  })
  .catch((err) => {
    console.log(`Ошибка при ${isCardLiked? 'снятии' : 'постановке'} лайка: ${err}`);
  })
}

// Редактирование профиял
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileForm.querySelector('.popup__button').textContent = 'Сохранение...'
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
  .then((userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModalWindow(profileFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    profileForm.querySelector('.popup__button').textContent = 'Сохранить'
  })
};

// Редактирование аватара
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  cardForm.querySelector('.popup__button').textContent = 'Сохранение...'
  setUserAvatar({
    avatar: avatarInput.value
  })
  .then((userData) => {
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    closeModalWindow(avatarFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    cardForm.querySelector('.popup__button').textContent = 'Сохранить'
  })
};

// Создание карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  cardForm.querySelector('.popup__button').textContent = 'Создание...'
  addUserCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
  .then((cardData) => {
    placesWrap.prepend(
      createCardElement(
        {
          name: cardData.name,
          link: cardData.link,
        },
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (cardElement) => handleLikeCard(cardElement, cardData._id),
          onDeleteCard: (cardElement) => handleDeleteCard(cardElement, cardData._id),
        }
      )
    );
    closeModalWindow(cardFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    cardForm.querySelector('.popup__button').textContent = 'Создать'
  })
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings)
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings)
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings)
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// отображение карточек и данных пользователя с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    cards.forEach((card) => {
        const cardElement = createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (cardElement) => handleLikeCard(cardElement, card._id),
          onDeleteCard: card.owner._id === userData._id? (cardElement) => handleDeleteCard(cardElement, card._id) : '',
          onCheckInfoCard: handleInfoClick,
        });
        if (card.likes.flat().find(like => like._id === userData._id)) {
          cardElement.querySelector('.card__like-button').classList.add('card__like-button_is-active')
        }
        cardElement.querySelector('.card__like-count').textContent = card.likes.length || ''
        placesWrap.append(cardElement)
        card.owner._id === userData._id ? '' : cardElement.querySelector('.card__control-button_type_delete').remove()
    });

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });
