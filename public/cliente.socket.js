const socket = io();
const messageForm = document.querySelector('#messageForm');
const userMailInput = document.querySelector('#userMailInput');
const userNameInput = document.querySelector('#userNameInput');
const userLastNameInput = document.querySelector('#userLastNameInput');
const userAgeInput = document.querySelector('#userAgeInput');
const userAliasInput = document.querySelector('#userAliasInput');
const userAvatarInput = document.querySelector('#userAvatarInput');
const messageInput = document.querySelector('#messageInput');
const messagesPool = document.querySelector('#messagesPool');
const formularioProd = document.querySelector('#formularioProd');
const prodTitle = document.querySelector('#prodTitle');
const prodPrice = document.querySelector('#prodPrice');
const prodImage = document.querySelector('#prodImage');
const productsPool = document.querySelector('#productsPool');

function denormalizeMensajes(objMensajes) {
    const author = new normalizr.schema.Entity(
        "author"
    );

    const mensaje = new normalizr.schema.Entity(
        "mensaje",
        { author: author },
        { idAttribute: "_id" }
    );

    const schemaMensajes = new normalizr.schema.Entity(
        "mensajes",
        {
        mensajes: [mensaje],
        }
    );

    const denormalized = normalizr.denormalize(
        objMensajes.result,
        schemaMensajes,
        objMensajes.entities
    );


    const logitudNormalized = JSON.stringify(objMensajes).length;
    const longitudDenormalized = JSON.stringify(denormalized).length;
    const porcentajeOptimizacion = (1 - (logitudNormalized / longitudDenormalized)).toFixed(2);

    const mensajesDenormalizados = denormalized.mensajes.map(mensaje => mensaje._doc)

    return { mensajesDenormalizados, porcentajeOptimizacion };
}

function sendMessage(messageInfo) {
    socket.emit('client:message', messageInfo)
}

function sendProduct(productInfo){
    socket.emit('client:product', productInfo)
}

function clearMessage(){
    messageInput.value = '';
}

function clearProduct(){
    prodTitle.value = '';
    prodPrice.value = ''; 
    prodImage.value = '';
}

async function renderMessages(messagesArray){;
    console.log(messagesArray);
    const mensajesDenormalizados = denormalizeMensajes(messagesArray).mensajesDenormalizados;
    const porcentajeOptimizacion = denormalizeMensajes(messagesArray).porcentajeOptimizacion;
    console.log(mensajesDenormalizados, porcentajeOptimizacion);
    const response = await fetch('./templates/messages.hbs');
    const content = await response.text();
    let template = Handlebars.compile(content);
    const html = template({mensajesDenormalizados});
    messagesPool.innerHTML = html;
}

async function renderProducts(productsArray){;
    const response = await fetch('./templates/products.hbs');
    const content = await response.text();
    let template = Handlebars.compile(content);
    const html = template({productsArray});
    productsPool.innerHTML = html;
}

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    if(userMailInput.value&&messageInput.value){
        const messageInfo = {
            author: {
                id: userMailInput.value,
                nombre: userNameInput.value || "nombreDefault",
                apellido: userLastNameInput.value || "apellidoDefault",
                edad: userAgeInput.value || 99,
                alias: userAliasInput.value || "aliasDefault",
                avatar: userAvatarInput.value || "avatarDefault"
            },
            text: messageInput.value
        }
        sendMessage(messageInfo);
        clearMessage();
    }
})

formularioProd.addEventListener('submit', e => {
    e.preventDefault();
    if(prodTitle.value&&prodPrice.value&&prodImage){
        const productInfo = {title:prodTitle.value, price:prodPrice.value, thumbnail:prodImage.value};
        sendProduct(productInfo);
        clearProduct();
    }
})

socket.on('server:messages', renderMessages);
socket.on('server:products', renderProducts);