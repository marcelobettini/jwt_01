import express from "express";
import jwt from "jsonwebtoken";
import morgan from "morgan";
const port = 3001;
const server = express();
server.disable("x-powered-by");
server.use(morgan("tiny"));
server.get("/api", (req, res) => res.json({ message: "JSON WEBTOKEN" }));
server.post("/api/login", (req, res) => {
  const user = {
    id: 1,
    name: "Marcelo",
    email: "marcelobettini@yahoo.com.ar",
  };
  //cuando el usuario se loguea (autenticación), creamos el token para identificarlo (autorización)
  //le pasamos el usuario que llega en la request -el que efectivamente se ha logueado- y la clave de seguridad
  jwt.sign(
    { user: user },
    "privateKey@123",
    { expiresIn: "10m" },
    (err, token) => {
      res.json({ token }); //simplemente token... ES6 (igual que arriba con user: user)
    }
  );
});
server.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "privateKey@123", (error, authData) => {
    if (error) {
      res.status(400).json({ message: "Forbidden access | No Valid Token" });
    } else {
      res.json({ message: "Post created!", authData: authData });
    }
  });
});

//creamos el middleware para verificar el token del usuario antes de garantizarle acceso a ruta posts
/*Whenever the user wants to access a protected route or resource, the user agent should send the JWT, typically in the Authorization header using the Bearer schema. The content of the header should look like the following:*/
//Authorization: Bearer < token >

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1]; //partimos bearerHeader en dos items de arreglo [0] = "Bearer" [1] el token
    req.token = bearerToken;
    next(); //pasamos al controlador
  } else {
    //si bearerHeader es undefined significa que no tengo token
    res.status(403).json({ message: "Forbidden access | No Token" });
  }
}
server.listen(port, err =>
  err
    ? console.warn("Servidor no conectado", { Error: err })
    : console.log(`Servidor levantado en http://localhost:${port}`)
);
