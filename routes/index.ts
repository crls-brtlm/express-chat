import * as express from "express";
const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  res.send({ response: "I am alive" }).status(200);
});

module.exports = router;
