import { IFormField } from "../../utils/form_factory";
import { TBrokerageFormProps } from "./Trades.interface";

const COMMISSION_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'per_mt', label: 'Per MT' },
];

export const BrokerageFormFields = (props: TBrokerageFormProps): IFormField[] => {
  const { trades, agents } = props;

  return [
    {
      name: 'trade_id',
      initailValue: '',
      label: 'Trade',
      type: 'select',
      uiType: 'select',
      options: trades,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'agent_id',
      initailValue: '',
      label: 'Agent',
      type: 'select',
      uiType: 'select',
      options: agents,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'commission_type',
      initailValue: '',
      label: 'Commission Type',
      type: 'select',
      uiType: 'select',
      options: COMMISSION_TYPE_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'commission_value',
      initailValue: 0,
      label: 'Commission Value',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
  ];
};