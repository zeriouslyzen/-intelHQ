import type { RegionCode } from "./regions";

export type WidgetConfig = {
  id: string;
  title: string;
  description?: string;
  dataSourceKey: "region_fx" | "region_commodities" | "region_events";
  config: {
    regionCode?: RegionCode;
    instrumentIds?: string[];
    timeframe?: string;
  };
};

export type LayoutSection = {
  id: string;
  title?: string;
  widgetConfigs: WidgetConfig[];
};
