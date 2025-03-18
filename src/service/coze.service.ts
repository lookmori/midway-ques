import { Provide } from '@midwayjs/decorator';
import { Config } from '@midwayjs/decorator';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as crypto from 'crypto';

@Provide()
export class CozeService {
  @Config('coze')
  cozeConfig: {
    clientId: string;
    privateKey: string;
    publicKeyId: string;
    apiBase: string;
  };

  // 缓存访问令牌
  private accessToken: string = null;
  private tokenExpireTime: number = 0;

  /**
   * 生成 JWT Token
   */
  private generateJWT() {
    // 生成随机字符串作为 jti
    const jti = crypto.randomBytes(32).toString('hex');
    
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: this.cozeConfig.publicKeyId
    };
    
    const payload = {
      iss: this.cozeConfig.clientId,
      aud: 'api.coze.cn',
      iat: now,
      exp: now + 3600, // 1小时过期
      jti: jti
    };

    // 使用 RS256 算法和私钥签名
    return jwt.sign(payload, this.cozeConfig.privateKey, { 
      algorithm: 'RS256',
      header: header
    });
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken() {
    // 如果已有有效的访问令牌，直接返回
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.tokenExpireTime > now + 60) {
      console.log('使用缓存的访问令牌');
      return this.accessToken;
    }

    try {
      console.log('生成新的 JWT Token');
      const jwtToken = this.generateJWT();
      
      console.log('请求访问令牌');
      const response = await axios({
        method: 'POST',
        url: 'https://api.coze.cn/api/permission/oauth2/token',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          duration_seconds: 86399, // 令牌有效期，最长24小时
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
        }
      });

      if (response.data && response.data.access_token) {
        console.log('成功获取访问令牌');
        this.accessToken = response.data.access_token;
        this.tokenExpireTime = now + response.data.expires_in;
        return this.accessToken;
      } else {
        console.error('获取访问令牌失败，响应数据不完整:', response.data);
        throw new Error('获取访问令牌失败，响应数据不完整');
      }
    } catch (error) {
      console.error('获取访问令牌失败:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 调用工作流
   */
  async invokeWorkflow(workflowId: string, params: any) {
    try {
      // 获取访问令牌
      const accessToken = await this.getAccessToken();
      
      console.log(`调用工作流 API，工作流ID: ${workflowId}`);
      const response = await axios({
        method: 'POST',
        url: `${this.cozeConfig.apiBase}/v1/workflow/run`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          workflow_id: workflowId,
          parameters: params
        }
      });

      console.log(`工作流调用成功，响应:`, response.data);
      return {
        code: 200,
        message: '工作流调用成功',
        data: response.data
      };
    } catch (error) {
      console.error('工作流调用失败:', error.response?.data || error.message);
      return {
        code: 500,
        message: '工作流调用失败',
        data: error.response?.data || null
      };
    }
  }
} 