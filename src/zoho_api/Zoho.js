import dotenv from 'dotenv';  // Para cargar las variables de entorno
import axios from 'axios';    // Usamos axios para hacer la solicitud HTTP

class Zoho {
  constructor() {
    dotenv.config();  // Cargar las variables de entorno desde el archivo .env
    this.clientId = process.env.CLIENT_ID_ZOHO;            // CLIENT_ID_ZOHO
    this.clientSecret = process.env.CLIENT_SECRET_ZOHO;    // CLIENT_SECRET_ZOHO
    this.refreshToken = process.env.REFRESH_TOKEN_ZOHO;    // REFRESH_TOKEN_ZOHO
  }

  // Método para obtener un nuevo access token desde el refresh token
  async getAccessToken() {
    try {
      console.log("Cargando las variables de entorno:");
      console.log("clientId: " + this.clientId);
      console.log("clientSecret: " + this.clientSecret);
      console.log("refreshToken: " + this.refreshToken);

      // Hacer la solicitud POST a Zoho para refrescar el token
      const response = await axios.post('https://accounts.zoho.eu/oauth/v2/token', null, {
        params: {
          client_id: this.clientId,           // Tu clientId de Zoho
          client_secret: this.clientSecret,   // Tu clientSecret de Zoho
          refresh_token: this.refreshToken,   // El refresh_token que tienes
          grant_type: 'refresh_token',        // Tipo de grant (refresh token)
        }
      });

      // Verificamos que la respuesta contiene el access_token
      if (response.data.access_token) {
        const accessToken = response.data.access_token;
        console.log('Nuevo token de acceso obtenido:', accessToken);
        return accessToken;  // Devolvemos el token de acceso generado
      } else {
        throw new Error('No se pudo obtener el access token.');
      }

    } catch (error) {
      console.error('Error al obtener el token de acceso:', error);
      throw new Error('Error al generar o refrescar el token de acceso.');
    }
  }
  async getZohoAccessToken() {
    const zoho = new Zoho();
    try {
      const accessToken = await zoho.getAccessToken();  // Llamamos a getAccessToken
      return accessToken;  // Devolvemos el token de acceso
    } catch (error) {
      console.error('Error al obtener el token de acceso:', error);
      throw new Error('No se pudo obtener el token de acceso.');
    }
  }
}
// probar que da token de acceso
//console.log("token:" + await getZohoAccessToken());

export default Zoho;