import express from 'express';
// import swaggerUi from 'swagger-ui-express'
// import YAML from 'yamljs'
import guesserRoutes from './routes/guesser';

const app = express();

app.use(express.json());
app.use('/api', guesserRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send({
        reason: err.message
    });
  });

export default app;