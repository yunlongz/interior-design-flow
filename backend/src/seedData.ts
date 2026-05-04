export const defaultNodes: Array<{
  id: string; title: string; type: string; detail: string;
  phaseId: number; deptId: number; sortOrder: number;
}> = [
  {
    "id": "p1_1",
    "title": "基础户型、红线范围",
    "type": "deliverable",
    "detail": "提供基础户型图纸及红线范围资料",
    "phaseId": 1,
    "deptId": 1,
    "sortOrder": 1
  },
  {
    "id": "p1_2",
    "title": "产品定位报告、基本面积指标、户型配比",
    "type": "deliverable",
    "detail": "编制产品定位报告，明确面积指标与户型配比",
    "phaseId": 1,
    "deptId": 1,
    "sortOrder": 2
  },
  {
    "id": "p1_3",
    "title": "确定户型优化设计单位",
    "type": "task",
    "detail": "立项、定标、合同签订",
    "phaseId": 1,
    "deptId": 1,
    "sortOrder": 3
  },
  {
    "id": "p1_4",
    "title": "优化平面布局逻辑",
    "type": "task",
    "detail": "稳定建筑外立面方案，组长配合责任建梳理",
    "phaseId": 1,
    "deptId": 1,
    "sortOrder": 4
  },
  {
    "id": "p1_5",
    "title": "上线计划 / 项目内控计划",
    "type": "task",
    "detail": "制定项目上线计划及内控计划",
    "phaseId": 1,
    "deptId": 1,
    "sortOrder": 5
  },
  {
    "id": "b1_1",
    "title": "建筑方案设计理念交底",
    "type": "task",
    "detail": "平面布局逻辑、前期产品及营销功能规划需求等",
    "phaseId": 1,
    "deptId": 2,
    "sortOrder": 1
  },
  {
    "id": "b1_2",
    "title": "确认公区大堂面积、面宽、进深",
    "type": "task",
    "detail": "提供公区大堂建筑条件",
    "phaseId": 1,
    "deptId": 2,
    "sortOrder": 2
  },
  {
    "id": "b1_3",
    "title": "样板间户型原始建筑图",
    "type": "deliverable",
    "detail": "地块总图、建筑外立面效果图、建筑模型",
    "phaseId": 1,
    "deptId": 2,
    "sortOrder": 3
  },
  {
    "id": "b1_4",
    "title": "批次户型平面图",
    "type": "deliverable",
    "detail": "户内箱体、立管点位、天花标高、公区管井、风口位梳理",
    "phaseId": 1,
    "deptId": 2,
    "sortOrder": 4
  },
  {
    "id": "i1_1",
    "title": "内装设计建议、产品配置标准表",
    "type": "deliverable",
    "detail": "编制内装设计建议书及产品配置标准表",
    "phaseId": 1,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "i1_2",
    "title": "确定样板间方案设计单位",
    "type": "task",
    "detail": "商务流程：招标、定标、合同签订",
    "phaseId": 1,
    "deptId": 4,
    "sortOrder": 2
  },
  {
    "id": "i1_3",
    "title": "确定样板间施工图及批次设计单位",
    "type": "task",
    "detail": "商务流程",
    "phaseId": 1,
    "deptId": 4,
    "sortOrder": 3
  },
  {
    "id": "c1_1",
    "title": "目标成本确定",
    "type": "task",
    "detail": "明确项目内装目标成本",
    "phaseId": 1,
    "deptId": 9,
    "sortOrder": 1
  },
  {
    "id": "pr1_1",
    "title": "招标策划会",
    "type": "review",
    "detail": "组织招标策划会议",
    "phaseId": 1,
    "deptId": 10,
    "sortOrder": 1
  },
  {
    "id": "i2_1",
    "title": "方案设计单位交底",
    "type": "task",
    "detail": "设计范围、房间配置、层高条件、景观资源、产品内装设计建议、目标成本、项目内控计划",
    "phaseId": 2,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "i2_2",
    "title": "样板间、公区平面布置图",
    "type": "deliverable",
    "detail": "设计单位需提供两到三个平面布置图",
    "phaseId": 2,
    "deptId": 4,
    "sortOrder": 2
  },
  {
    "id": "i2_3",
    "title": "平面调整",
    "type": "task",
    "detail": "确认平面布局逻辑及空间尺寸、基本配置",
    "phaseId": 2,
    "deptId": 4,
    "sortOrder": 3
  },
  {
    "id": "i2_4",
    "title": "概念意向及空间素模",
    "type": "deliverable",
    "detail": "三个以上概念意向、平面尺寸标注、建筑原始轴线尺寸标注",
    "phaseId": 2,
    "deptId": 4,
    "sortOrder": 4
  },
  {
    "id": "i2_5",
    "title": "样板间及公区概念方案",
    "type": "deliverable",
    "detail": "汇报总监 → 组内初步评审 → 汇报部门总",
    "phaseId": 2,
    "deptId": 4,
    "sortOrder": 5
  },
  {
    "id": "i2_6",
    "title": "汇报 COO/事业部总经理",
    "type": "review",
    "detail": "概念方案最终汇报",
    "phaseId": 2,
    "deptId": 4,
    "sortOrder": 6
  },
  {
    "id": "b2_1",
    "title": "确认对建筑外立面影响",
    "type": "task",
    "detail": "薄墙体范围梳理、门洞尺寸、管井位置梳理沟通",
    "phaseId": 2,
    "deptId": 2,
    "sortOrder": 1
  },
  {
    "id": "b2_2",
    "title": "样板房门头方案",
    "type": "task",
    "detail": "若为异地样板房，需确认门头方案",
    "phaseId": 2,
    "deptId": 2,
    "sortOrder": 2
  },
  {
    "id": "b2_3",
    "title": "建筑外立面条件复核、管井条件复核",
    "type": "task",
    "detail": "确认功能配置、天花净高",
    "phaseId": 2,
    "deptId": 2,
    "sortOrder": 3
  },
  {
    "id": "l2_1",
    "title": "样板岛总图、景观方案",
    "type": "deliverable",
    "detail": "提供样板区景观设计方案",
    "phaseId": 2,
    "deptId": 3,
    "sortOrder": 1
  },
  {
    "id": "p2_1",
    "title": "确认公区大堂面积、面宽、进深",
    "type": "task",
    "detail": "与内装团队确认公区条件",
    "phaseId": 2,
    "deptId": 1,
    "sortOrder": 1
  },
  {
    "id": "i3_1",
    "title": "样板间、公区效果图方案",
    "type": "deliverable",
    "detail": "完成效果图设计",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "i3_2",
    "title": "样板间、公区方案汇报",
    "type": "review",
    "detail": "汇报 COO/事业部总经理",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 2
  },
  {
    "id": "i3_3",
    "title": "差异户型组内评审",
    "type": "review",
    "detail": "差异户型总监评审 → 汇报部门总",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 3
  },
  {
    "id": "i3_4",
    "title": "样板间、公区扩初图",
    "type": "deliverable",
    "detail": "建筑初设图配合",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 4
  },
  {
    "id": "i3_5",
    "title": "方案阶段成本优化点",
    "type": "task",
    "detail": "主材实样准备",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 5
  },
  {
    "id": "i3_6",
    "title": "内装建筑平面合图",
    "type": "task",
    "detail": "照明方案沟通",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 6
  },
  {
    "id": "i3_7",
    "title": "样板间扩初图会审、交底",
    "type": "review",
    "detail": "户内：与建筑外立面核对、管井核对；公区：防火门核对、电梯净空核对",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 7
  },
  {
    "id": "i3_8",
    "title": "方案阶段成本测算",
    "type": "task",
    "detail": "参会部门：建筑、产品、招采、成本",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 8
  },
  {
    "id": "i3_9",
    "title": "方案阶段交底",
    "type": "task",
    "detail": "交底重点：不同空间的成本倾斜、初步的交标与非交标划分、特殊材料、特殊工艺",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 9
  },
  {
    "id": "i3_10",
    "title": "方案阶段成本优化成果",
    "type": "deliverable",
    "detail": "优化方向：交标与非交标划分、工艺做法基层优化、替代材料优化、造型优化或减少",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 10
  },
  {
    "id": "i3_11",
    "title": "汇报 COO/事业部总经理",
    "type": "review",
    "detail": "方案阶段成本情况汇报：未超目标成本/超目标成本分支",
    "phaseId": 3,
    "deptId": 4,
    "sortOrder": 11
  },
  {
    "id": "b3_1",
    "title": "结构降板范围配合",
    "type": "task",
    "detail": "天花净高与设备配合",
    "phaseId": 3,
    "deptId": 2,
    "sortOrder": 1
  },
  {
    "id": "b3_2",
    "title": "确认样板间管井位置、烟道位置、薄墙体范围",
    "type": "task",
    "detail": "提资给内装团队",
    "phaseId": 3,
    "deptId": 2,
    "sortOrder": 2
  },
  {
    "id": "b3_3",
    "title": "确认公区风井位置、管井位置",
    "type": "task",
    "detail": "提资给内装团队",
    "phaseId": 3,
    "deptId": 2,
    "sortOrder": 3
  },
  {
    "id": "b3_4",
    "title": "确认信报箱位置",
    "type": "task",
    "detail": "提资",
    "phaseId": 3,
    "deptId": 2,
    "sortOrder": 4
  },
  {
    "id": "b3_5",
    "title": "临时样板房门头界面划分",
    "type": "task",
    "detail": "明确界面范围",
    "phaseId": 3,
    "deptId": 2,
    "sortOrder": 5
  },
  {
    "id": "b3_6",
    "title": "翻图工作",
    "type": "task",
    "detail": "确定标准户型与变异户型，并确定户型编号；确认电梯轿厢厅门净宽及轿厢净空、装饰荷载",
    "phaseId": 3,
    "deptId": 2,
    "sortOrder": 6
  },
  {
    "id": "ld3_1",
    "title": "照明设计方案",
    "type": "deliverable",
    "detail": "灯具布置图、初版灯具回路图、灯具选型建议",
    "phaseId": 3,
    "deptId": 7,
    "sortOrder": 1
  },
  {
    "id": "ld3_2",
    "title": "照明方案沟通",
    "type": "task",
    "detail": "与内装方案团队沟通照明方案",
    "phaseId": 3,
    "deptId": 7,
    "sortOrder": 2
  },
  {
    "id": "c3_1",
    "title": "方案阶段成本测算",
    "type": "task",
    "detail": "根据产品配置标准表明确各品类的品牌或范围",
    "phaseId": 3,
    "deptId": 9,
    "sortOrder": 1
  },
  {
    "id": "c3_2",
    "title": "方案阶段成本优化点组内评审",
    "type": "review",
    "detail": "方案阶段成本情况汇报总监",
    "phaseId": 3,
    "deptId": 9,
    "sortOrder": 2
  },
  {
    "id": "pr3_1",
    "title": "参与方案阶段交底",
    "type": "task",
    "detail": "目的：根据产品配置标准表明确各品类的品牌或范围",
    "phaseId": 3,
    "deptId": 10,
    "sortOrder": 1
  },
  {
    "id": "p3_1",
    "title": "确认分集水器、强弱电箱、扫地机器人位置",
    "type": "task",
    "detail": "确定机电点位定位，确定产品",
    "phaseId": 3,
    "deptId": 1,
    "sortOrder": 1
  },
  {
    "id": "p3_2",
    "title": "X.0 落地项确认",
    "type": "task",
    "detail": "确认配置产品",
    "phaseId": 3,
    "deptId": 1,
    "sortOrder": 2
  },
  {
    "id": "p3_3",
    "title": "批次户型优化",
    "type": "task",
    "detail": "参照户型平面确认；延展：户型90%相似，尺度变化或房间增加；参照：户型有变化，风格参照样板间",
    "phaseId": 3,
    "deptId": 1,
    "sortOrder": 3
  },
  {
    "id": "s3_1",
    "title": "硬软装方案拉通",
    "type": "task",
    "detail": "软装灯具增加点位确认",
    "phaseId": 3,
    "deptId": 18,
    "sortOrder": 1
  },
  {
    "id": "e3_1",
    "title": "样板间管综条件核对",
    "type": "task",
    "detail": "配合机电系统图",
    "phaseId": 3,
    "deptId": 12,
    "sortOrder": 1
  },
  {
    "id": "d4_1",
    "title": "样板间、公区第一版施工图",
    "type": "deliverable",
    "detail": "批次户型条件核对",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 1
  },
  {
    "id": "d4_2",
    "title": "修改样板间、公区扩初提资图",
    "type": "task",
    "detail": "砌体图——土建墙体尺寸、门洞高宽、电梯门洞高宽；与建筑第二次合图",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 2
  },
  {
    "id": "d4_3",
    "title": "所有房间方案全模",
    "type": "deliverable",
    "detail": "完成全模设计",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 3
  },
  {
    "id": "d4_4",
    "title": "节点深化",
    "type": "task",
    "detail": "洁具五金选型、电器选型、开关面板选型、岩板/砖/墙布/木地板",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 4
  },
  {
    "id": "d4_5",
    "title": "第一版施工图审图",
    "type": "review",
    "detail": "意见反馈 → 审图意见汇报总监",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 5
  },
  {
    "id": "d4_6",
    "title": "样板间、公区施工图",
    "type": "deliverable",
    "detail": "基层做法明确、重要造型节点完善",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 6
  },
  {
    "id": "d4_7",
    "title": "精装平面合图",
    "type": "task",
    "detail": "汇报设计总",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 7
  },
  {
    "id": "d4_8",
    "title": "移交版样板间蓝图",
    "type": "deliverable",
    "detail": "物料表编制完成",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 8
  },
  {
    "id": "d4_9",
    "title": "白图阶段成本测算",
    "type": "task",
    "detail": "门窗分隔图核对、外装型材颜色核对、阳台顶面颜色拉通",
    "phaseId": 4,
    "deptId": 6,
    "sortOrder": 9
  },
  {
    "id": "b4_1",
    "title": "责任建确认精装报建策略",
    "type": "decision",
    "detail": "简装报建 / 一次性精装报建；确认变异户型的出图方式；确认变异阳台的出图方式",
    "phaseId": 4,
    "deptId": 2,
    "sortOrder": 1
  },
  {
    "id": "b4_2",
    "title": "建筑初设图",
    "type": "deliverable",
    "detail": "提供建筑初设条件",
    "phaseId": 4,
    "deptId": 2,
    "sortOrder": 2
  },
  {
    "id": "b4_3",
    "title": "门窗分隔图",
    "type": "deliverable",
    "detail": "提供门窗分隔图纸",
    "phaseId": 4,
    "deptId": 2,
    "sortOrder": 3
  },
  {
    "id": "p4_1",
    "title": "洁具五金选型",
    "type": "task",
    "detail": "战采选型 / 战采不满足选型分支",
    "phaseId": 4,
    "deptId": 1,
    "sortOrder": 1
  },
  {
    "id": "p4_2",
    "title": "电器选型",
    "type": "task",
    "detail": "开关面板选型",
    "phaseId": 4,
    "deptId": 1,
    "sortOrder": 2
  },
  {
    "id": "p4_3",
    "title": "战采品牌开关、插座",
    "type": "task",
    "detail": "智能化开关及插座选型",
    "phaseId": 4,
    "deptId": 1,
    "sortOrder": 3
  },
  {
    "id": "p4_4",
    "title": "战采选型确认",
    "type": "decision",
    "detail": "1、样板间时间满足，战采单位复样；2、样板间时间不满足，战采单位确认可复样后，样板间乙供",
    "phaseId": 4,
    "deptId": 1,
    "sortOrder": 4
  },
  {
    "id": "p4_5",
    "title": "配置产品确认",
    "type": "task",
    "detail": "特殊选型组内沟通",
    "phaseId": 4,
    "deptId": 1,
    "sortOrder": 5
  },
  {
    "id": "ld4_1",
    "title": "照明节点深化",
    "type": "task",
    "detail": "非智能化：照明设计回路标准；智能化：智能化场景对应回路",
    "phaseId": 4,
    "deptId": 7,
    "sortOrder": 1
  },
  {
    "id": "ld4_2",
    "title": "灯具布置图、初版灯具回路图、灯具选型提资图",
    "type": "deliverable",
    "detail": "A档：照明方案、智控系统设计；BC档：照明设计标准化指引",
    "phaseId": 4,
    "deptId": 7,
    "sortOrder": 2
  },
  {
    "id": "ld4_3",
    "title": "确认回路及场景模式名称",
    "type": "task",
    "detail": "组内评审 → 总监评审 → 设计总评审",
    "phaseId": 4,
    "deptId": 7,
    "sortOrder": 3
  },
  {
    "id": "c4_1",
    "title": "方案阶段成本优化点组内评审",
    "type": "review",
    "detail": "参会",
    "phaseId": 4,
    "deptId": 9,
    "sortOrder": 1
  },
  {
    "id": "c4_2",
    "title": "白图阶段成本测算",
    "type": "task",
    "detail": "参会",
    "phaseId": 4,
    "deptId": 9,
    "sortOrder": 2
  },
  {
    "id": "pr4_1",
    "title": "特殊材料招采提前摸排",
    "type": "task",
    "detail": "参会",
    "phaseId": 4,
    "deptId": 10,
    "sortOrder": 1
  },
  {
    "id": "pr4_2",
    "title": "招采协同",
    "type": "task",
    "detail": "结构复核",
    "phaseId": 4,
    "deptId": 10,
    "sortOrder": 2
  },
  {
    "id": "i4_1",
    "title": "实物样板",
    "type": "deliverable",
    "detail": "完整主材材料样板；设计单位打样存在困难的样品，可协同招采进行材料打样",
    "phaseId": 4,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "i4_2",
    "title": "护窗栏杆深化",
    "type": "task",
    "detail": "楼梯深化",
    "phaseId": 4,
    "deptId": 4,
    "sortOrder": 2
  },
  {
    "id": "i4_3",
    "title": "样板间硬装交标项梳理",
    "type": "task",
    "detail": "确认硬装交标项；拉通硬装预埋位置处政府拍照处理办法",
    "phaseId": 4,
    "deptId": 4,
    "sortOrder": 3
  },
  {
    "id": "i4_4",
    "title": "简化版公区效果图 / 公区实际交标效果图",
    "type": "deliverable",
    "detail": "评审版对客公区效果图；汇报总监",
    "phaseId": 4,
    "deptId": 4,
    "sortOrder": 4
  },
  {
    "id": "i4_5",
    "title": "项目评审",
    "type": "review",
    "detail": "参会",
    "phaseId": 4,
    "deptId": 4,
    "sortOrder": 5
  },
  {
    "id": "i4_6",
    "title": "硬软装界面划分",
    "type": "task",
    "detail": "明确界面",
    "phaseId": 4,
    "deptId": 4,
    "sortOrder": 6
  },
  {
    "id": "e4_1",
    "title": "确认硬装需预埋事项",
    "type": "task",
    "detail": "参会",
    "phaseId": 4,
    "deptId": 12,
    "sortOrder": 1
  },
  {
    "id": "e4_2",
    "title": "机电设备类配置",
    "type": "task",
    "detail": "参会",
    "phaseId": 4,
    "deptId": 12,
    "sortOrder": 2
  },
  {
    "id": "l4_1",
    "title": "结构深化（若有）",
    "type": "task",
    "detail": "配合精装需求",
    "phaseId": 4,
    "deptId": 3,
    "sortOrder": 1
  },
  {
    "id": "bim4_1",
    "title": "配合机电系统图",
    "type": "task",
    "detail": "BIM模型配合",
    "phaseId": 4,
    "deptId": 8,
    "sortOrder": 1
  },
  {
    "id": "sm4_1",
    "title": "智能化系统选择",
    "type": "task",
    "detail": "确定智能化系统品牌",
    "phaseId": 4,
    "deptId": 21,
    "sortOrder": 1
  },
  {
    "id": "sm4_2",
    "title": "开关面板打样",
    "type": "task",
    "detail": "一次机电点位确认",
    "phaseId": 4,
    "deptId": 21,
    "sortOrder": 2
  },
  {
    "id": "sm4_3",
    "title": "批次机电系统图",
    "type": "deliverable",
    "detail": "智能化点位图纸",
    "phaseId": 4,
    "deptId": 21,
    "sortOrder": 3
  },
  {
    "id": "e5_1",
    "title": "样板间硬装进场",
    "type": "milestone",
    "detail": "正式进场施工",
    "phaseId": 5,
    "deptId": 12,
    "sortOrder": 1
  },
  {
    "id": "e5_2",
    "title": "施工重难点梳理",
    "type": "task",
    "detail": "工艺重难点、材料重难点、对施工周期影响重难点、施工细节重难点",
    "phaseId": 5,
    "deptId": 12,
    "sortOrder": 2
  },
  {
    "id": "e5_3",
    "title": "工艺样板打样要求",
    "type": "task",
    "detail": "设计向工程交底、图纸答疑",
    "phaseId": 5,
    "deptId": 12,
    "sortOrder": 3
  },
  {
    "id": "e5_4",
    "title": "样板间石材选大板",
    "type": "task",
    "detail": "材料复样",
    "phaseId": 5,
    "deptId": 12,
    "sortOrder": 4
  },
  {
    "id": "e5_5",
    "title": "石材、岩板排板",
    "type": "task",
    "detail": "现场实施排板",
    "phaseId": 5,
    "deptId": 12,
    "sortOrder": 5
  },
  {
    "id": "e5_6",
    "title": "样板间硬装完成，样板间移交",
    "type": "milestone",
    "detail": "硬装完工并移交",
    "phaseId": 5,
    "deptId": 12,
    "sortOrder": 6
  },
  {
    "id": "d5_1",
    "title": "二次专项深化",
    "type": "task",
    "detail": "淋浴隔断、橱柜、入户门、非交标衣柜、其他特殊专项",
    "phaseId": 5,
    "deptId": 6,
    "sortOrder": 1
  },
  {
    "id": "d5_2",
    "title": "二次深化及审图",
    "type": "review",
    "detail": "硬装材料确认、二次深化及审图及选型",
    "phaseId": 5,
    "deptId": 6,
    "sortOrder": 2
  },
  {
    "id": "d5_3",
    "title": "相关设计优化",
    "type": "task",
    "detail": "图纸疑问、设计优化、设计变更",
    "phaseId": 5,
    "deptId": 6,
    "sortOrder": 3
  },
  {
    "id": "d5_4",
    "title": "图纸导PDF",
    "type": "task",
    "detail": "建筑设计院盖章",
    "phaseId": 5,
    "deptId": 6,
    "sortOrder": 4
  },
  {
    "id": "d5_5",
    "title": "建筑概要表",
    "type": "deliverable",
    "detail": "建筑信息、内装信息汇总",
    "phaseId": 5,
    "deptId": 6,
    "sortOrder": 5
  },
  {
    "id": "i5_1",
    "title": "协同厂家深化",
    "type": "task",
    "detail": "配合二次深化",
    "phaseId": 5,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "i5_2",
    "title": "图纸修改",
    "type": "task",
    "detail": "根据现场反馈调整图纸",
    "phaseId": 5,
    "deptId": 4,
    "sortOrder": 2
  },
  {
    "id": "a5_1",
    "title": "精装报建",
    "type": "task",
    "detail": "简装报建 / 精装报建",
    "phaseId": 5,
    "deptId": 19,
    "sortOrder": 1
  },
  {
    "id": "a5_2",
    "title": "图纸审核",
    "type": "review",
    "detail": "报建图上线",
    "phaseId": 5,
    "deptId": 19,
    "sortOrder": 2
  },
  {
    "id": "b5_1",
    "title": "建筑相关调整",
    "type": "task",
    "detail": "核对 → 调整",
    "phaseId": 5,
    "deptId": 2,
    "sortOrder": 1
  },
  {
    "id": "m5_1",
    "title": "机电相关调整",
    "type": "task",
    "detail": "核对 → 调整",
    "phaseId": 5,
    "deptId": 22,
    "sortOrder": 1
  },
  {
    "id": "s5_1",
    "title": "软装摆场",
    "type": "task",
    "detail": "样板间硬装完成后进行软装摆场",
    "phaseId": 5,
    "deptId": 18,
    "sortOrder": 1
  },
  {
    "id": "mk6_1",
    "title": "预售准备",
    "type": "task",
    "detail": "配合样板间开放预售",
    "phaseId": 6,
    "deptId": 14,
    "sortOrder": 1
  },
  {
    "id": "i6_1",
    "title": "评审版对客公区效果图",
    "type": "deliverable",
    "detail": "用于对外展示",
    "phaseId": 6,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "e6_1",
    "title": "现场实施配合",
    "type": "task",
    "detail": "配合预售阶段现场需求",
    "phaseId": 6,
    "deptId": 12,
    "sortOrder": 1
  },
  {
    "id": "d7_1",
    "title": "批次户型点位预留提资",
    "type": "task",
    "detail": "批次点位调整变更",
    "phaseId": 7,
    "deptId": 6,
    "sortOrder": 1
  },
  {
    "id": "d7_2",
    "title": "批次户型条件核对",
    "type": "task",
    "detail": "核对建筑、机电调整",
    "phaseId": 7,
    "deptId": 6,
    "sortOrder": 2
  },
  {
    "id": "b7_1",
    "title": "建筑相关调整核对",
    "type": "task",
    "detail": "核对建筑调整内容",
    "phaseId": 7,
    "deptId": 2,
    "sortOrder": 1
  },
  {
    "id": "m7_1",
    "title": "机电相关调整核对",
    "type": "task",
    "detail": "核对机电调整内容",
    "phaseId": 7,
    "deptId": 22,
    "sortOrder": 1
  },
  {
    "id": "i7_1",
    "title": "批次点位调整变更",
    "type": "task",
    "detail": "根据核对结果调整点位",
    "phaseId": 7,
    "deptId": 4,
    "sortOrder": 1
  },
  {
    "id": "e8_1",
    "title": "批次施工实施",
    "type": "milestone",
    "detail": "批次精装施工全面展开",
    "phaseId": 8,
    "deptId": 12,
    "sortOrder": 1
  },
  {
    "id": "d8_1",
    "title": "批次施工图深化",
    "type": "task",
    "detail": "根据调整后的条件图深化批次施工图",
    "phaseId": 8,
    "deptId": 6,
    "sortOrder": 1
  },
  {
    "id": "c8_1",
    "title": "批次成本核算",
    "type": "task",
    "detail": "批次施工阶段成本核算",
    "phaseId": 8,
    "deptId": 9,
    "sortOrder": 1
  }
];

export const defaultConnections: Array<{
  fromNode: string; toNode: string; type: string; description: string;
}> = [
  {
    "fromNode": "p1_1",
    "toNode": "i1_1",
    "type": "提资",
    "description": "产品提供基础户型资料"
  },
  {
    "fromNode": "p1_2",
    "toNode": "i1_1",
    "type": "提资",
    "description": "产品定位报告作为内装设计输入"
  },
  {
    "fromNode": "p1_3",
    "toNode": "i1_2",
    "type": "流程",
    "description": "确定设计单位"
  },
  {
    "fromNode": "b1_1",
    "toNode": "i2_1",
    "type": "交底",
    "description": "建筑方案设计理念交底"
  },
  {
    "fromNode": "b1_3",
    "toNode": "i2_2",
    "type": "提资",
    "description": "原始建筑图作为设计输入"
  },
  {
    "fromNode": "i1_1",
    "toNode": "i2_1",
    "type": "输入",
    "description": "内装设计建议作为交底内容"
  },
  {
    "fromNode": "i1_2",
    "toNode": "i2_1",
    "type": "流程",
    "description": "确定方案设计单位后启动设计"
  },
  {
    "fromNode": "i2_4",
    "toNode": "i3_1",
    "type": "演进",
    "description": "概念意向深化为效果图方案"
  },
  {
    "fromNode": "i2_5",
    "toNode": "i3_2",
    "type": "汇报",
    "description": "概念方案通过后汇报效果图方案"
  },
  {
    "fromNode": "b2_1",
    "toNode": "i3_1",
    "type": "配合",
    "description": "建筑外立面条件配合方案设计"
  },
  {
    "fromNode": "l2_1",
    "toNode": "i3_1",
    "type": "提资",
    "description": "景观方案提资"
  },
  {
    "fromNode": "i2_6",
    "toNode": "i3_4",
    "type": "流程",
    "description": "概念方案审批通过后进入扩初设计"
  },
  {
    "fromNode": "ld3_1",
    "toNode": "i3_7",
    "type": "配合",
    "description": "照明方案配合扩初图会审"
  },
  {
    "fromNode": "i3_4",
    "toNode": "i3_7",
    "type": "流程",
    "description": "扩初图完成后进行会审"
  },
  {
    "fromNode": "i3_7",
    "toNode": "i3_8",
    "type": "流程",
    "description": "扩初会审通过后进行成本测算"
  },
  {
    "fromNode": "i3_8",
    "toNode": "i3_11",
    "type": "汇报",
    "description": "成本测算结果汇报"
  },
  {
    "fromNode": "c3_2",
    "toNode": "i3_11",
    "type": "输入",
    "description": "成本优化评审结果"
  },
  {
    "fromNode": "i3_4",
    "toNode": "d4_1",
    "type": "深化",
    "description": "扩初图深化为施工图"
  },
  {
    "fromNode": "b4_1",
    "toNode": "d4_1",
    "type": "决策",
    "description": "报建策略影响施工图出图方式"
  },
  {
    "fromNode": "d4_1",
    "toNode": "d4_5",
    "type": "审图",
    "description": "第一版施工图完成后送审"
  },
  {
    "fromNode": "d4_5",
    "toNode": "d4_6",
    "type": "修改",
    "description": "根据审图意见修改"
  },
  {
    "fromNode": "p4_1",
    "toNode": "d4_4",
    "type": "选型",
    "description": "洁具五金选型输入节点深化"
  },
  {
    "fromNode": "ld4_2",
    "toNode": "d4_6",
    "type": "配合",
    "description": "照明图纸配合施工图"
  },
  {
    "fromNode": "d4_6",
    "toNode": "d4_8",
    "type": "流程",
    "description": "施工图完成后输出移交版蓝图"
  },
  {
    "fromNode": "i4_1",
    "toNode": "d4_8",
    "type": "输入",
    "description": "材料样板作为移交内容"
  },
  {
    "fromNode": "d4_8",
    "toNode": "e5_1",
    "type": "移交",
    "description": "蓝图移交后硬装进场"
  },
  {
    "fromNode": "d5_2",
    "toNode": "e5_1",
    "type": "交底",
    "description": "深化审图完成后向工程交底"
  },
  {
    "fromNode": "e5_2",
    "toNode": "e5_3",
    "type": "流程",
    "description": "梳理重难点后确定工艺样板"
  },
  {
    "fromNode": "e5_3",
    "toNode": "e5_4",
    "type": "流程",
    "description": "工艺样板确认后选材"
  },
  {
    "fromNode": "e5_5",
    "toNode": "e5_6",
    "type": "流程",
    "description": "排板完成后硬装完工"
  },
  {
    "fromNode": "a5_2",
    "toNode": "e5_1",
    "type": "前置",
    "description": "图纸审核通过后进场"
  },
  {
    "fromNode": "e5_6",
    "toNode": "mk6_1",
    "type": "支撑",
    "description": "样板间完工支撑预售"
  },
  {
    "fromNode": "s5_1",
    "toNode": "mk6_1",
    "type": "支撑",
    "description": "软装摆场完成支撑开放"
  },
  {
    "fromNode": "e5_6",
    "toNode": "d7_1",
    "type": "输入",
    "description": "样板间经验输入批次设计"
  },
  {
    "fromNode": "b7_1",
    "toNode": "d7_2",
    "type": "提资",
    "description": "建筑调整核对"
  },
  {
    "fromNode": "m7_1",
    "toNode": "d7_2",
    "type": "提资",
    "description": "机电调整核对"
  },
  {
    "fromNode": "d7_2",
    "toNode": "i7_1",
    "type": "流程",
    "description": "条件核对后调整点位"
  },
  {
    "fromNode": "d7_1",
    "toNode": "e8_1",
    "type": "提资",
    "description": "点位预留提资后施工"
  },
  {
    "fromNode": "d8_1",
    "toNode": "e8_1",
    "type": "图纸",
    "description": "批次施工图指导施工"
  }
];
