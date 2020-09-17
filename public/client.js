const PORT = process.env.PORT || 5500;
const url = `http://localhost:${PORT}`;

const API_URL = url + '/items';
const API_URL_SEARCH = url + '/searchItems';
const API_URL_EXCEL = url + '/excel';
const API_URL_UPDATE = url + '/update';

// const API_URL =
//   window.location.href == 'localhost'
//     ? 'http://localhost:5500/items'
//     : 'https://itamar-locks.vercel.app/items';
// const API_URL_SEARCH =
//   window.location.href == 'localhost'
//     ? 'http://localhost:5500/searchItems'
//     : 'https://itamar-locks.vercel.app/searchItems';
// const API_URL_EXCEL =
//   window.location.href == 'localhost'
//     ? 'http://localhost:5500/excel'
//     : 'https://itamar-locks.vercel.app/excel';
// const API_URL_UPDATE =
//   window.location.href == 'localhost'
//     ? 'http://localhost:5500/update/'
//     : 'https://itamar-locks.vercel.app/update';

// const API_URL = "http://localhost:5500/items"
// const API_URL_SEARCH = "http://localhost:5500/searchItems"
// const API_URL_EXCEL = "http://localhost:5500/excel"
// const API_URL_UPDATE = "http://localhost:5500/update/"

//button group action
const addActionOption = document.querySelector('#addItem');
const excelActionOption = document.querySelector('#uploadExcelToServer');
const searchActionOption = document.querySelector('#searchItem');

//forms
const searchForm = document.querySelector('#searchForm');
const excelForm = document.querySelector('#excelForm');
const addItemForm = document.querySelector('#addItemForm');
const modalForm = document.querySelector('#modalForm');

//loading
const loading = document.querySelector('.loading');

//elements
const itemsElement = document.querySelector('.items');

const row = document.createElement('div');
row.className = 'row';

//Listeners
addActionOption.addEventListener('click', () => {
  console.log('addItem');
  excelForm.style.display = 'none';
  searchForm.style.display = 'none';
  addItemForm.style.display = 'block';
  itemsElement.style.display = 'none';
});

excelActionOption.addEventListener('click', () => {
  console.log('excelAction');
  excelForm.style.display = 'block';
  addItemForm.style.display = 'none';
  searchForm.style.display = 'none';
  itemsElement.style.display = 'none';
});

searchActionOption.addEventListener('click', () => {
  console.log('searchAction');
  excelForm.style.display = 'none';
  addItemForm.style.display = 'none';
  searchForm.style.display = 'block';
  itemsElement.style.display = 'block';
});

addItemForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loading.style.display = 'block';
  addItemForm.style.display = 'none';

  const formData = new FormData(addItemForm);

  const name = formData.get('name');
  const ammount = formData.get('ammount');
  const location = formData.get('location');

  const item = {
    name,
    ammount,
    location,
  };

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
      'content-type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((createdItem) => {
      console.log(createdItem);
      addItemForm.reset();
      loading.style.display = 'none';
      addItemForm.style.display = 'block';
    });
});

searchForm.addEventListener('submit', (event) => {
  search(event);
});

function search(event, changedQuery) {
  itemsElement.innerHTML = '';
  loading.style.display = 'block';

  if (event !== undefined) {
    event.preventDefault();
  }
  const formData = new FormData(searchForm);
  var query = formData.get('search');
  if (changedQuery !== '' && changedQuery !== undefined) query = changedQuery;
  if (query === '') {
    const p = document.createElement('p');
    p.textContent = 'אנא הזן טקסט לחיפוש';
    itemsElement.appendChild(p);
    loading.style.display = 'none';
  } else {
    listAllItems(query);
  }
}

function listAllItems(query) {
  itemsElement.innerHTML = '';
  row.innerHTML = '';

  let appendThis = '/'.concat(query);

  fetch(API_URL.concat(appendThis))
    .then((res) => res.json())
    .then((items) => {
      console.log(items);
      if (items.length > 0) {
        items.reverse();
        // var count = 0;
        items.forEach((element) => {
          createCardElement(element /*, count*/);
          // count++;
        });
        itemsElement.appendChild(row);
        loading.style.display = 'none';
      } else {
        const p = document.createElement('p');
        p.textContent = 'לא נמצאו פריטים, אנא נסה לחפש פריט אחר';
        itemsElement.appendChild(p);
        loading.style.display = 'none';
      }
    });
}

function createCardElement(item /*, count */) {
  const grid = document.createElement('div');
  grid.className = 'col-sm-6';

  const card = document.createElement('div');
  card.className = 'card';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const cardTitle = document.createElement('h5');
  cardTitle.className = 'card-title';
  cardTitle.textContent = item.name;

  const itemLocation = document.createElement('p');
  itemLocation.className = 'card-text';
  itemLocation.textContent = `נמצא במיקום : ${item.location}`;

  const edit = document.createElement('img');
  edit.src = '/images/edit.png';
  edit.className = 'card-edit-mode';
  edit.onclick = () => {
    jQuery('#exampleModal').modal('show');
    var modalBody = document.getElementById('exampleModal').children[0]
      .children[0].children[0].children[0];
    modalBody.children[1].value = item.name;
    modalBody.children[3].value = item.location;
    modalBody.children[4].value = item._id;
  };

  cardBody.appendChild(cardTitle);
  // cardBody.appendChild(itemAmmount);
  // cardBody.appendChild(createdDate);
  cardBody.appendChild(itemLocation);

  card.appendChild(cardBody);
  card.append(edit);
  grid.appendChild(card);
  row.appendChild(grid);
}

modalForm.addEventListener('submit', (event) => {
  event.preventDefault();

  var formData = new FormData(modalForm);
  var name = formData.get('name');
  var id = formData.get('id');
  var location = formData.get('location');

  const update = {
    id: id,
    name: name,
    location: location,
  };

  console.log(update);

  fetch(API_URL_UPDATE, {
    method: 'POST',
    body: JSON.stringify(update),
    headers: {
      'content-type': 'application/json',
    },
  }).then((res) => {
    jQuery('#exampleModal').modal('hide');
    search(undefined, name);
  });
});
