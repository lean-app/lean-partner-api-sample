import WorkerService, { GET_WORKER } from '../../../lean-sdk/services/workers.service';

export const handler = async (event: any) => {
    try {
        const result = await WorkerService.perform({
            type: GET_WORKER
        });

        return ({ statusCode: 200, body: JSON.stringify(result) });
    } catch (error) {
        console.error(error);
        return ({ status: 500, body: JSON.stringify(error)});
    } 
};