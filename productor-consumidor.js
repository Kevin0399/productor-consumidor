const MAX = 18;         // Numero de espacios en el contenedor
let intervalo = null;   // Intervalo de tiempo principal de simulacion
let relojGlobal = -1;   // Tiempo Global
let pausado = false;    // Bandera de pausa
let segundo = 1;        // Bandera para indicar cuando ha pasado un segundo completo
let turno = -1;         // Determina de quien es turno 

// Definimos la clase de nuestros elementos
class Equipo {
    constructor() {
        const imagenes = ["imagenes/imagen1.png", "imagenes/imagen2.png", "imagenes/imagen3.png", "imagenes/imagen4.png", "imagenes/imagen5.png", "imagenes/imagen6.png",
            "imagenes/imagen7.png", "imagenes/imagen8.png", "imagenes/imagen9.png", "imagenes/imagen10.png", "imagenes/imagen11.png", "imagenes/imagen12.png", "imagenes/imagen13.png",
            "imagenes/imagen14.png", "imagenes/imagen15.png", "imagenes/imagen16.png", "imagenes/imagen17.png", "imagenes/imagen18.png"];
        const indice = Math.floor(Math.random() * imagenes.length);
        this.titulo = `Equipo ${indice + 1}`;
        this.imgRuta = imagenes[indice];
    }
};

// Definimos la clase Nodo para representar cada elemento en la lista
class Nodo {
    constructor() {
        this.equipo = null;
        this.anterior = null;
        this.siguiente = null;
    }
};

// Definicion del objeto Buffer
const Buffer = {
    tamanio: 0,
    enUso: false, // Determina si hay alguien dentro del bufer
    contenedor: [],
};


const iniciarBuffer = () => {

    // Enlazamos el contenedor de manera circular
    for (let i = 0; i < MAX; i++) {
        Buffer.contenedor.push(new Nodo()); // Insertamos un nuevo Nodo
        /*
        Enlazamos circularmente hacia atrás
        i = 0: Buffer.contenedor[0].anterior = (0 - 1 + 5) % 5 = 4
        i = 1: Buffer.contenedor[1].anterior = (1 - 1 + 5) % 5 = 0
        i = 2: Buffer.contenedor[2].anterior = (2 - 1 + 5) % 5 = 1
        i = 3: Buffer.contenedor[3].anterior = (3 - 1 + 5) % 5 = 2
        i = 4: Buffer.contenedor[4].anterior = (4 - 1 + 5) % 5 = 3
        */
        Buffer.contenedor[i].anterior = (i - 1 + MAX) % MAX;

        // Enlazamos circularmente hacia adelante
        // Si i es 4, (i + 1) % MAX será (4 + 1) % 5 = 0, lo que significa que el nodo siguiente al último nodo es el primer nodo
        Buffer.contenedor[i].siguiente = (i + 1) % MAX;
    }
}


const Productor = {
    estado: 'activo',
    dormir: 0,
    tiempoDormido: 0,
    cantProducir: 0,
    cantProducido: 0,
    nodoSiguiente: 0,
    produciendo: false,
    primerDormir: false,
    acabaDespertar: false,

    /**
     * 
     * @param {Object} Buffer contiene el contenedor de elementos
     */
    producir(Buffer) {
        if (this.cantProducir == -1 && !this.primerDormir) {
            this.estado = 'dormido'
            this.dormir = aleatorio(6, 3);
            this.cantProducir = 0;
            this.primerDormir = true;
        }
        else if (this.cantProducido < this.cantProducir) {
            console.log('Productor');
            this.produciendo = true;
            Buffer.contenedor[this.nodoSiguiente].equipo = new Equipo(); // Se produce un nuevo elemento
            this.nodoSiguiente = Buffer.contenedor[this.nodoSiguiente].siguiente; // Asignamos el indice del siguiente espacio en la contenedor a escribir
            this.cantProducido++;
            Buffer.tamanio++;
        }
        else if (this.cantProducido >= this.cantProducir) {
            this.cantProducido = 0;
            this.cantProducir = 0;
            this.produciendo = false;
        }
    },
};


const Consumidor = {
    estado: 'activo',
    dormir: 0,
    tiempoDormido: 0,
    cantConsumir: 0,
    cantConsumido: 0,
    nodoSiguiente: 0,
    consumiendo: false,
    primerDormir: false,
    acabaDespertar: false,

    /**
     * 
     * @param {Object} Buffer contiene el contenedor de elementos
     */
    consumir(Buffer) {
        if (this.cantConsumir == -1 && !this.primerDormir) {
            this.estado = 'dormido'
            this.dormir = aleatorio(6, 3);
            this.cantConsumir = 0;
            this.primerDormir = true;
        }
        else if (this.cantConsumido < this.cantConsumir) {
            console.log('Consumidor');
            this.consumiendo = true;
            Buffer.contenedor[this.nodoSiguiente].equipo = null;
            this.nodoSiguiente = Buffer.contenedor[this.nodoSiguiente].siguiente;
            this.cantConsumido++;
            Buffer.tamanio++;
        }
        else {
            this.cantConsumido = 0;
            this.cantConsumir = 0;
            this.consumiendo = false;
        }
    },

};



/**
 * @param {Number<int>} max // Limite maximo
 * @param {Number<int>} min // Limite minimo
 * @returns Numero aleatorio entre los rangos proporcionados
 */
const aleatorio = (max, min) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**

 * @returns La cantidad de elementos en el buffer
 */
const cantElementos = () => {
    let tamanio = 0;
    Buffer.contenedor.forEach(p => {
        if (p.equipo != null)
            tamanio++;
    });
    return tamanio;
};

/**
 * Despierta al consumidor/productor
 * @param {Object} objeto Productor o Consumidor 
 */

const despertar = (objeto) => {
    objeto.estado = 'activo';
    objeto.dormir = 0;
    objeto.tiempoDormido = 0;
    objeto.primerDormir = false;
    objeto.acabaDespertar = true;
};

// Funcion principal de ejecucion
const main = () => {
    // Ocultar botón de inicio
    document.getElementById('btnStart').style.display = 'none';

    // Mostrar panel de información
    document.getElementById('info').style.display = 'flex';

    // Inicializar mensajes
    document.getElementById('mensajeProd').innerText = 'Productor listo';
    document.getElementById('mensajeCons').innerText = 'Consumidor listo';

    // Inicializar buffer
    iniciarBuffer();

    // Iniciar el tick cada segundo
    if (!intervalo) intervalo = setInterval(tick, 500);

    // Render inicial
    render();
}

// Bucle principal de la simulacion
const tick = () => {

    if (pausado) return;

    Buffer.tamanio = cantElementos(Buffer);


    segundo++;
    if (segundo == 2) {
        relojGlobal++;   // Incrementar reloj global 
        console.log({ relojGlobal });
        turno = Productor.acabaDespertar ? 1 :
            Consumidor.acabaDespertar ? 0 : aleatorio(1, 0);

        if (Productor.acabaDespertar)
            Productor.acabaDespertar = false;
        if (Consumidor.acabaDespertar)
            Consumidor.acabaDespertar = false;

        // Despertar 
        if (Consumidor.estado == 'dormido')
            Consumidor.tiempoDormido >= Consumidor.dormir - 1 ? despertar(Consumidor) : Consumidor.tiempoDormido++;
        if (Productor.estado == 'dormido')
            Productor.tiempoDormido >= Productor.dormir - 1 ? despertar(Productor) : Productor.tiempoDormido++;

        segundo = 0;
    }
    else if (!Productor.produciendo && !Consumidor.consumiendo) {
        if (Productor.estado != 'dormido' || Consumidor.estado != 'dormido') {
            turno = Productor.acabaDespertar ? 1 :
                Consumidor.acabaDespertar ? 0 : aleatorio(1, 0);
        }
        return;
    }

    // Entra consumidor
    if ((turno == 0 || Consumidor.consumiendo) && !Productor.produciendo) {
        if (!Consumidor.consumiendo) {
            if (Buffer.tamanio > 5)
                Consumidor.cantConsumir = aleatorio(6, 3);
            else if (Buffer.tamanio < 3)
                Consumidor.cantConsumir = -1;
            else if (Buffer.tamanio > 2 && Buffer.tamanio < 6)
                Consumidor.cantConsumir = aleatorio(cantElementos(), 3);
        }

        Consumidor.consumir(Buffer);
    }

    // Entra productor
    else if ((turno == 1 || Productor.produciendo) && !Consumidor.consumiendo) {
        if (!Productor.produciendo) {
            if (Buffer.tamanio < 13)
                Productor.cantProducir = aleatorio(6, 3);
            else if (Buffer.tamanio > 16)
                Productor.cantProducir = -1;
            else if (Buffer.tamanio < 15 && Buffer.tamanio > 12)
                Productor.cantProducir = aleatorio(18 - cantElementos(), 3);
        }

        Productor.producir(Buffer);
    }

    render();
};

// Renderiza en pantalla
const render = () => {
    // Mostrar el panel de información
    document.getElementById('info').style.display = "flex";

    // Actualizar reloj global
    document.getElementById('reloj').innerText = `Reloj Global: ${relojGlobal}`;

    // Actualizar estados del productor
    document.getElementById('estadoProductor').innerText = `Productor: ${Productor.estado}`;
    if (Productor.estado === 'dormido') {
        document.getElementById('dormidoProd').style.visibility = 'visible';
        document.getElementById('dormidoProd').innerText = `Tiempo Dormido: ${Productor.tiempoDormido}`;
    } else {
        document.getElementById('dormidoProd').style.visibility = 'hidden';
    }

    // Actualizar mensajes del productor
    let mensajeProd = '';
    if (Productor.produciendo) {
        mensajeProd = `Produciendo elemento ${Productor.cantProducido} de ${Productor.cantProducir}`;
    } else if (Productor.estado === 'dormido') {
        mensajeProd = `Dormido por ${Productor.dormir} segundos`;
    }
    else if (turno == 1 && Consumidor.consumiendo) {
        mensajeProd = 'Productor intenta entrar';
    }
    document.getElementById('mensajeProd').innerText = mensajeProd;

    // Actualizar estados del consumidor
    document.getElementById('estadoConsumidor').innerText = `Consumidor: ${Consumidor.estado}`;
    if (Consumidor.estado === 'dormido') {
        document.getElementById('dormidoCons').style.visibility = 'visible';
        document.getElementById('dormidoCons').innerText = `Tiempo Dormido: ${Consumidor.tiempoDormido}`;
    } else {
        document.getElementById('dormidoCons').style.visibility = 'hidden';
    }

    // Actualizar mensajes del consumidor
    let mensajeCons = '';
    if (Consumidor.consumiendo) {
        mensajeCons = `Consumiendo elemento ${Consumidor.cantConsumido} de ${Consumidor.cantConsumir}`;
    } else if (Consumidor.estado === 'dormido') {
        mensajeCons = `Dormido por ${Consumidor.dormir} segundos`;
    }
    else if (turno == 0 && Productor.produciendo) {
        mensajeCons = 'Consumidor intenta entrar';
    }
    document.getElementById('mensajeCons').innerText = mensajeCons;

    // Actualizar turno
    document.getElementById('turno').innerHTML = `Turno de ${turno === 1 ? 'Productor' : 'Consumidor'} <br> <br>
                                                  En Buffer: ${Productor.produciendo ? 'Productor' :
                                                               Consumidor.consumiendo ? 'Consumidor' : 'Libre'}`;

    // Actualizar tamaño del buffer
    document.getElementById('tamBuffer').innerText = `Tamaño Buffer: ${Buffer.tamanio} / ${MAX}`;

    // Actualizar visualización del buffer
    const contenedor = document.getElementById('contenedorBuffer');
    contenedor.innerHTML = '';
    Buffer.contenedor.forEach(nodo => {
        const div = document.createElement('div');
        div.classList.add('casilla');
        const img = document.createElement('img');
        img.src = nodo.equipo ? nodo.equipo.imgRuta : 'imagenes/vacioBlanco.png';
        img.alt = nodo.equipo ? nodo.equipo.titulo : 'Espacio vacío';
        img.classList.add('imagenEquipo');
        div.appendChild(img);
        contenedor.appendChild(div);
    });
}

// Pausar - Despausar
document.addEventListener("keydown", (e) => {
    const tecla = e.key.toUpperCase();

    // Si estamos en pausa, solo permitir C para continuar
    if (pausado && tecla !== "C") return; // Ignorar otras teclas mientras esta en pausa

    else if (tecla === "P") {
        pausado = true; // Pausar simulacion
    } else if (tecla === "C") {
        pausado = false; // Continuar simulacion
    }
    else if (tecla === "ESCAPE") {
        location.reload();
    }
});

document.getElementById('btnStart').addEventListener('click', () => {
    main(); // Iniciar simulacion
});
