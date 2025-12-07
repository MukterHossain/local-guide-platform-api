import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import config from './config';
import router from './routes';
import cookieParser from 'cookie-parser';
import { PaymentController } from './modules/payments/payment.controller';
import cron from 'node-cron';
import { BookingService } from './modules/bookings/booking.service';

const app: Application = express();

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
);


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


cron.schedule('* * * * *', () => {
    try {
        console.log("Node cron called at ", new Date())
        BookingService.cancelUnpaidBookings();
    } catch (err) {
        console.error(err);
    }
});

app.use("/api", router)

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});


app.use(globalErrorHandler);

app.use(notFound);

export default app;