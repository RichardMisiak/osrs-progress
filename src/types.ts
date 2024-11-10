export type ColumnConfig = {
  key: keyof FormattedSkillData;
  title: string;
  formatter?: (v: any) => any;
};

export type SkillData = {
  id: number;
  name: string;
  rank: number;
  level: number;
  xp: number;
};

export type FormattedSkillData = SkillData & {
  percent: number;
};

export type StatsResponse = {
  skills: SkillData[];
};
