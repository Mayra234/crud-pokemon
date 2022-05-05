let pokemons = [];
const pokemonApi = usePokemonApi();
const pokemonForm = document.getElementById('pokemon-form');
const fields = document.querySelectorAll('#pokemon-form .form-field');
const pokemonTbody = document.getElementById('pokemon-table');
const contentButtons = document.getElementById('content-buttons');
const addButton = document.getElementById('add');
addButton.addEventListener('click', pokemonFormAction);

const loader = document.getElementById('loader');

const handleLoader = (status) => {
  switch (status) {
    case 'show':
      loader.style.display = 'flex';
      break;
    case 'hide':
      loader.style.display = 'none';
      break;
    default:
      break;
  }
};

let pokemonFormMode = 'create';
let pokemonId = undefined;

let currentPokemon = {
  name: '',
  type: '',
  softSpot: '',
  image: '',
  description: '',
};

function validate(event) {
  const { name, value } = event.target;
  currentPokemon[name] = value;
}

fields.forEach((field) => {
  field.addEventListener('input', validate);
});

function pokemonFormAction() {
  switch (pokemonFormMode) {
    case 'create':
      createPokemon();
      break;
    case 'update':
      updatePokemon();
      break;
    default:
      break;
  }
}

function changeActionPokemonButton() {
  switch (pokemonFormMode) {
    case 'create':
      addButton.innerText = 'Agregar';
      addButton.className = 'btn btn-primary';
      break;
    case 'update':
      addButton.innerText = 'Actualizar';
      addButton.className = 'btn btn-info text-white';
      break;
    default:
      break;
  }
}

function cancelpokemonActionButton() {
  switch (pokemonFormMode) {
    case 'create':
      document.getElementById('cancel-button').remove();
      break;
    case 'update':
      if (document.getElementById('cancel-button') !== null) {
        return;
      } else {
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.innerText = 'Cancelar';
        cancelButton.type = 'button';
        cancelButton.addEventListener('click', () => {
          cancelButton.remove();
          pokemonFormMode = 'create';
          pokemonForm.reset();
          changeActionPokemonButton();
        });
        contentButtons.appendChild(cancelButton);
      }

      break;
    default:
      break;
  }
}

async function createPokemon() {
  handleLoader('show');
  const pokemon = await pokemonApi.create(currentPokemon);
  pokemons.push({ ...pokemon });
  listPokemons();
  pokemonForm.reset();
  handleLoader('hide');
}

async function updatePokemon() {
  handleLoader('show');
  const pokemon = await pokemonApi.update(pokemonId, currentPokemon);
  pokemons = pokemons.map((item) => {
    if (item.id === pokemonId) {
      return { ...pokemon };
    }

    return item;
  });
  listPokemons();
  pokemonForm.reset();
  pokemonFormMode = 'create';
  changeActionPokemonButton();
  cancelpokemonActionButton();
  handleLoader('hide');
}

async function deletePokemon(id) {
  handleLoader('show');
  await pokemonApi.remove(id);
  pokemons = pokemons.filter((pokemon) => {
    return pokemon.id !== id;
  });
  listPokemons();
  handleLoader('hide');
}

function loadPokemonInForm(id) {
  pokemonFormMode = 'update';
  pokemonId = id;
  currentPokemon = pokemons.find((pokemon) => pokemon.id === id);

  fields.forEach((field) => {
    field.value = currentPokemon[field.name];
  });
  changeActionPokemonButton();
  cancelpokemonActionButton();
}

const modalHtmlElement = document.getElementById('view-pokemon');
const boostrapModal = new bootstrap.Modal(modalHtmlElement);

async function showPokemon(id) {
  handleLoader('show');
  const pokemon = await pokemonApi.read(id);
  //Llamar el api para mostrar el pokemon
  const modalTitle = document.querySelector('#view-pokemon .modal-title');
  const modalBody = document.querySelector('#view-pokemon .modal-body');
  boostrapModal.show();
  modalBody.innerHTML = `
      <ul>
        <li>${pokemon.image}</li>
        <li><b>Tipo:</b> ${pokemon.type}</li>
        <li><b>Debilidad:</b> ${pokemon.softSpot}</li>
        <li><b>Descripcion:</b> ${pokemon.description}</li>
      </ul>
      `;
  modalTitle.innerText = pokemon.name;
  handleLoader('hide');
}

async function listPokemons(firstLoad) {
  handleLoader('show');
  pokemonTbody.innerHTML = '';
  if (firstLoad) pokemons = await pokemonApi.list();
  pokemons.forEach((pokemon) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <th scope="row">${pokemon.id}</th>
            <td>${pokemon.name}</td>
            <td>${pokemon.type}</td>
            <td>${pokemon.softSpot}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadPokemonInForm(${pokemon.id})">
                    Editar
                    </button>
                <button
                    type="button"
                    class="btn btn-info text-white"
                    onclick="showPokemon(${pokemon.id})">
                    Ver registro
                    </button>
                <button
                    type="button"
                    class="btn btn-danger"
                    onclick="deletePokemon(${pokemon.id})">
                    Eliminar
                    </button>
            </td>
        `;
    pokemonTbody.appendChild(row);
  });
  handleLoader('hide');
}
listPokemons(true);
