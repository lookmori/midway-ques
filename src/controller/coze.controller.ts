import { Inject, Controller, Post, Body } from '@midwayjs/decorator';
import { CozeService } from '../service/coze.service';

@Controller('/api/coze')
export class CozeController {
  @Inject()
  cozeService: CozeService;

  @Post('/workflow')
  async invokeWorkflow(@Body() body: { ques_desc: string; ques_ans: string }) {
    const workflowId = '7476350823728218175';
    const { ques_desc, ques_ans } = body;
    
    // 构造工作流所需的参数
    const params = {
      ques_desc,
      ques_ans
    };

    return await this.cozeService.invokeWorkflow(workflowId, params);
  }
} 