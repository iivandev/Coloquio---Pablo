const LIMITE = 35;

const API_URL = `https://pokeapi.co/api/v2/pokemon?limit=${LIMITE}`;

const container = document.getElementById("pokemon-container");
const inputNombre = document.querySelector("#filtroNombre");
const selectTipo = document.querySelector("#filtroTipo");
const selectAltura = document.querySelector("#filtroAltura");
const selectPeso = document.querySelector("#filtroPeso");
const selectOrden = document.querySelector("#ordenCriterio");
const selectDireccion = document.querySelector("#ordenDireccion");
const btnLimpiar = document.querySelector("#btnLimpiar");

let todosLosPokemon = [];

const mensaje = document.createElement("p"); 
document.body.appendChild(mensaje);          


// TRAER LOS DATOS DE LA API 

async function ObtenerPokemon() {
    mensaje.textContent = "Cargando Pokémon...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("No se pudo obtener los Pokémon");
        }

        const data = await response.json();


        for (let pokemon of data.results) {
            const responsePokemon = await fetch(pokemon.url);

            if (!responsePokemon.ok) {
                throw new Error("No se pudo obtener " + pokemon.name);
            }

            const pokemonData = await responsePokemon.json();

            todosLosPokemon.push({
                id: pokemonData.id,
                name: pokemonData.name,
                image: pokemonData.sprites.front_default,
                height: pokemonData.height / 10,
                weight: pokemonData.weight / 10,
                types: pokemonData.types.map(item => item.type.name)
            });
        }

        mostrarPokemon(todosLosPokemon);

        llenarSelectTipos();
        activarEventos();

        mensaje.textContent = "";

    } catch (error) {
        console.log("Error:", error);
        mensaje.textContent = "Ocurrió un problema: " + error.message;
    } finally {
        console.log("Petición finalizada");
    }
}


// MOSTRAR LAS CARDS EN EL DOM

function mostrarPokemon(lista) {
    container.textContent = "";
    if (lista.length === 0) {
        container.textContent = "No hay Pokémon que cumplan los filtros.";
        return; 
    }

    for (let pokemon of lista) {
        const card = document.createElement("div");
        const titulo = document.createElement("h2");
        const imagen = document.createElement("img");
        const numero = document.createElement("p");
        const tipos = document.createElement("p");
        const altura = document.createElement("p");
        const peso = document.createElement("p");

        card.className = "pokemon-card";
        titulo.textContent = pokemon.name;
        imagen.src = pokemon.image;
        imagen.alt = pokemon.name;
        numero.textContent = "Número: " + pokemon.id;
        tipos.textContent = "Tipo: " + pokemon.types.join(", "); 
        altura.textContent = "Altura: " + pokemon.height + " m";
        peso.textContent = "Peso: " + pokemon.weight + " kg";

        card.appendChild(titulo);
        card.appendChild(imagen);
        card.appendChild(numero);
        card.appendChild(tipos);
        card.appendChild(altura);
        card.appendChild(peso);
        container.appendChild(card);
    }
}


// LLENAR EL SELECT DE TIPOS

function llenarSelectTipos() {
    const tipos = [];

    for (let pokemon of todosLosPokemon) {
        for (let tipo of pokemon.types) {
            if (!tipos.includes(tipo)) {
                tipos.push(tipo);
            }
        }
    }
    tipos.sort((a, b) => a.localeCompare(b));
    for (let tipo of tipos) {
        const option = document.createElement("option"); 
        option.value = tipo;                              
        option.textContent = tipo;
        selectTipo.appendChild(option);                   
    }
}


// EVENTOS

function activarEventos() {
    inputNombre.addEventListener("input", aplicarFiltros);
    selectTipo.addEventListener("change", aplicarFiltros);
    selectAltura.addEventListener("change", aplicarFiltros);
    selectPeso.addEventListener("change", aplicarFiltros);
    selectOrden.addEventListener("change", aplicarFiltros);
    selectDireccion.addEventListener("change", aplicarFiltros);
    btnLimpiar.addEventListener("click", limpiarFiltros);
}

function aplicarFiltros() {
    const texto = inputNombre.value.trim().toLowerCase();
    const tipo = selectTipo.value;
    const altura = selectAltura.value;
    const peso = selectPeso.value;
    const resultado = todosLosPokemon.filter(pokemon => {
        const coincideNombre = pokemon.name.includes(texto);

        const coincideTipo = tipo === "todos" || pokemon.types.includes(tipo);

        let coincideAltura;
        switch (altura) {
            case "baja":
                coincideAltura = pokemon.height < 1;
                break;
            case "media":
                coincideAltura = pokemon.height >= 1 && pokemon.height < 2;
                break;
            case "alta":
                coincideAltura = pokemon.height >= 2;
                break;
            default: 
                coincideAltura = true;
        }

        let coincidePeso;
        switch (peso) {
            case "liviano":
                coincidePeso = pokemon.weight < 10;
                break;
            case "medio":
                coincidePeso = pokemon.weight >= 10 && pokemon.weight < 50;
                break;
            case "pesado":
                coincidePeso = pokemon.weight >= 50;
                break;
            default: // "todos": no filtra
                coincidePeso = true;
        }
        return coincideNombre && coincideTipo && coincideAltura && coincidePeso;
    });

    ordenarPokemon(resultado);
    mostrarPokemon(resultado);
}

function ordenarPokemon(lista) {
    const criterio = selectOrden.value;
    const direccion = selectDireccion.value; 

    lista.sort((a, b) => {
        let comparacion;

        if (criterio === "name") {
            comparacion = a.name.localeCompare(b.name);
        } else {
            comparacion = a[criterio] - b[criterio];
        }
        return direccion === "asc" ? comparacion : -comparacion;
    });
}


// LIMPIAR FILTROS

function limpiarFiltros() {
    inputNombre.value = "";
    selectTipo.value = "todos";
    selectAltura.value = "todas";
    selectPeso.value = "todos";
    selectOrden.value = "id";
    selectDireccion.value = "asc";

    aplicarFiltros(); 
}


// ARRANQUE

ObtenerPokemon();