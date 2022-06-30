const { Router } = require('express');
const axios = require ('axios');
const router = Router();
const {Occupation,Character} = require ('../db')

const getApiInfo = async () => {//me traigo toda la info de character del enpoit de la api
  const apiUrl = await axios.get('https://breakingbadapi.com/api/characters');

  const apiInfo= await apiUrl.data.map(el => {//mapeo esa info y le voy a indicar que me devulva lo que le indique
    return {//le indico que me devuelva esto
      id: el.char_id,
      name: el.name,
      nickname: el.nickname,
      birthday: el.birthday,
      status: el.status,
      occupation: el.occupation.map(el => el),
      image: el.img,
      appearance: el.appearance.map(el => el),
    };
  });
  return apiInfo;//retorno la info que le pedi
};

const getDbInfo= async () => {
          return await Character.findAll({//traeme toda la info de character de db
    include: {//en esa info quiero me incluyas lo siguiente
      model: Occupation,
      attributes: ["name"],
      through: {//es una comprobacion de uqe me quiero traer los atributos
        attributes: [],
      },
    },
  })
};

const getAllCharacters= async () => {//aca concateno l info de api y de db
  const apiInfo = await getApiInfo();
  const dbInfo = await getDbInfo();
  const infoTotal= apiInfo.concat(dbInfo);
  return infoTotal;
};
//esta ruta es para cuando el cliente busca un numbre, esta ruta va a filtrar el nombre que busco
router.get('/characters', async (req, res) => {
  const name = req.query.name;//busca si hay un name por query
  const charactersTotal = await getAllCharacters();

  if (name) {//si hay un name hago lo siguiente
    const characterName = await charactersTotal.filter(el => el.name.toLowerCase().includes(name.toLowerCase()));
     characterName ?
      res.status(200).send(characterName) :
      res.status(404).send('No esta el personaje');
  } else {
    res.status(200).send(charactersTotal);
  }
})

const getCharactersById = async (req, res) => {
  const id = req.params.id;

  const characters = await allCharactersApiDb();

  if (id) {
    const characterId = await characters?.filter(
      (el) => el.id.toString() == id.toString()
    );
    if (characterId) {
      res.status(200).json(characterId);
    } else {
      res.status(404).json({ message: "Character not found" });
    }
  } else {
    res.status(200).json(characters);
  }
};


//me traigo de la api a la base de datos la info de ocupaciones, para poder usar la info de db
 router.get('/occupations', async (req, res) => { 
  const occupationsApi = await axios.get('https://breakingbadapi.com/api/characters')
  const occupations = occupationsApi.data.map(el => el.occupation)//hago un map de las ocupaciones, me devuelve ,uchos arreglos
  const occEach = occupations.map( el => {//hago un map para ingresar a cada uno de esos arreglos 
     for (let i=0; i<el.length; i++)//recorro el map de arriba
     return el[i]})//devolveme cada uno de esos elemento que estan en ,los arreglos

     occEach.forEach(el => {// entra a mi modelo occupation y hace un findeorcreate(entra y si esa ocupacion ya esta lo deja pasar y si no locrea)
      Occupation.findOrCreate({
        where: { name: el}
      })
     })
     const allOccupations = await Occupation.findAll(); //guardo en una const todas las ocupaciones. en conclu me traigo toda las ocup de la api a db y la trabajo desde ahi
     res.send(allOccupations);
    })

  router.post('/character', async (req, res)=>{
    let {
       name,
       nickname,
       birthday,
       image,
       status,
       createInDb,
       occupation
    } = req.body //todo esto detalle me traigo del body

    let characterCreated = await Character.create ({//aca creo el pj con todo esto detalle
       name,
       nickname,
       birthday,
       image,
       status,
       createInDb,
    })
     let occupationDb = await Occupation.findAll({//en findall busco el modelo que tiene todas las ocupaciones para agregar dicha ocupaccion al pj
          where: { name : occupation}

     })
    characterCreated.addOcuppation(occupationDb) //le digo a charactercreated agregale la ocupacion que encontraste
    res.send('Personaje creado con exito')
  })

  router.get('/characters/:id', async (req,res) =>{
    const id = req.params.id;
    const charactersTotal = await getAllCharacters()//me traigo todo
    if (id){
       let character = await charactersTotal.filter( el => el.id == id) //de ntro de esos personaje filtrame el id que te estoy pasando
       characterId.length?
       res.status(200).json(characterId) :
       res.status(404).send('No encontre ese personaje')
    }
  })

module.exports = router;
