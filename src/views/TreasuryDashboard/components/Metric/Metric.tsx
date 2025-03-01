import { t } from "@lingui/macro";
import { Metric } from "@olympusdao/component-library";
import { STAKING_CONTRACT_DECIMALS } from "src/constants/decimals";
import { formatCurrency, parseBigNumber } from "src/helpers";
import { useCurrentIndex } from "src/hooks/useCurrentIndex";
import { useGohmPrice, useOhmPrice } from "src/hooks/usePrices";
import {
  useMarketCap,
  useOhmCirculatingSupply,
  useTotalSupply,
  useTreasuryMarketValue,
} from "src/hooks/useProtocolMetrics";

type MetricProps = PropsOf<typeof Metric>;

const sharedProps: MetricProps = {
  labelVariant: "h6",
  metricVariant: "h5",
};

export const MarketCap = () => {
  const { data: marketCap } = useMarketCap();

  const props: MetricProps = {
    ...sharedProps,
    label: t`Market Cap`,
  };

  if (marketCap) props.metric = formatCurrency(marketCap, 0);
  else props.isLoading = true;

  return <Metric {...props} />;
};

export const OHMPrice = () => {
  const { data: ohmPrice } = useOhmPrice();

  const props: MetricProps = {
    ...sharedProps,
    label: t`ORCL Price`,
  };

  if (ohmPrice) props.metric = formatCurrency(ohmPrice, 2);
  else props.isLoading = true;

  return <Metric {...props} />;
};

export const CircSupply = () => {
  const { data: totalSupply } = useTotalSupply();
  const { data: circSupply } = useOhmCirculatingSupply();

  const props: MetricProps = {
    ...sharedProps,
    label: t`Circulating Supply (total)`,
  };

  if (circSupply && totalSupply) props.metric = `${circSupply.toFixed()} / ${totalSupply.toFixed()}`;
  else props.isLoading = true;

  return <Metric {...props} />;
};

export const BackingPerOHM = () => {
  const { data: circSupply } = useOhmCirculatingSupply();
  const { data: treasuryValue } = useTreasuryMarketValue();

  const props: MetricProps = {
    ...sharedProps,
    label: t`Backing per ORCL`,
  };

  if (treasuryValue && circSupply) props.metric = formatCurrency(treasuryValue / circSupply, 2);
  else props.isLoading = true;

  return <Metric {...props} />;
};

export const CurrentIndex = () => {
  const { data: currentIndex } = useCurrentIndex();

  const props: MetricProps = {
    ...sharedProps,
    label: t`Current Index`,
    tooltip: t`The current index tracks the amount of sORCL accumulated since the beginning of staking. Basically, how much sORCL one would have if they staked and held 1 ORCL from launch.`,
  };

  if (currentIndex) props.metric = `${parseBigNumber(currentIndex, STAKING_CONTRACT_DECIMALS).toFixed(2)} sORCL`;
  else props.isLoading = true;

  return <Metric {...props} />;
};

export const GOHMPrice = () => {
  const { data: gOhmPrice } = useGohmPrice();

  const props: MetricProps = {
    ...sharedProps,
    label: t`gORCL Price`,
    className: "wsoprice",
    tooltip:
      t`gORCL = sORCL * index` +
      "\n\n" +
      t`The price of gORCL is equal to the price of ORCL multiplied by the current index`,
  };

  if (gOhmPrice) props.metric = formatCurrency(gOhmPrice, 2);
  else props.isLoading = true;

  return <Metric {...props} />;
};
