import { IFormField } from "../../utils/form_factory";
import { TTradeFormProps } from "./Trades.interface";

export const TradeFormFields = (props: TTradeFormProps): IFormField[] => {
  const { buyers, grainTypes, hubs } = props;

  return [
    {
      name: 'buyer_id',
      initailValue: '',
      label: 'Buyer',
      type: 'select',
      uiType: 'select',
      options: buyers,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'grain_type_id',
      initailValue: '',
      label: 'Grain Type',
      type: 'select',
      uiType: 'select',
      options: grainTypes,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'quantity_mt',
      initailValue: 0,
      label: 'Quantity (MT)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'grade',
      initailValue: '',
      label: 'Grade',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'price_per_mt',
      initailValue: 0,
      label: 'Price per MT',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'hub_id',
      initailValue: '',
      label: 'Hub',
      type: 'select',
      uiType: 'select',
      options: hubs,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
  ];
};