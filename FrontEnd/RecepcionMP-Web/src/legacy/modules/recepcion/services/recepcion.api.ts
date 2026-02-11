import { http } from '../../../shared/utils/http';

export const obtenerRecepciones = async () => {
  const response = await http.get('/recepcion');
  return response.data;
};

export const crearRecepcion = (data: any) => {
  return http.post('/recepcion', data);
};
