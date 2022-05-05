import "./Stake.scss";

import { t, Trans } from "@lingui/macro";
import { Box, Grid, Typography, Zoom } from "@material-ui/core";
// import { ExpandMore } from "@material-ui/icons";
// import { Skeleton } from "@material-ui/lab";
import {
  // DataRow,
  Input,
  // InputWrapper,
  Metric,
  MetricCollection,
  Paper,
  PrimaryButton,
} from "@olympusdao/component-library";
import { ethers } from "ethers";
import { ChangeEvent, ChangeEventHandler, memo, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import ConnectButton from "src/components/ConnectButton/ConnectButton";
import { useAppSelector } from "src/hooks";
import { usePathForNetwork } from "src/hooks/usePathForNetwork";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";

import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import { getGohmBalFromSohm, trim } from "../../helpers";
import { error } from "../../slices/MessagesSlice";
import { changeApproval, changeStake } from "../../slices/StakeThunk";
import { changeApproval as changeGohmApproval } from "../../slices/WrapThunk";
import { ConfirmDialog } from "./ConfirmDialog";
// import ExternalStakePool from "./ExternalStakePool";

const Ico: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { provider, address, connect, networkId } = useWeb3Context();
  usePathForNetwork({ pathName: "ico", networkID: networkId, history });

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const isAppLoading = useAppSelector(state => state.app.loading);
  const currentIndex = useAppSelector(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useAppSelector(state => {
    return state.app.fiveDayRate;
  });
  const ohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.ohm;
  });
  const sohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.sohm;
  });
  const sohmV1Balance = useAppSelector(state => {
    return state.account.balances && state.account.balances.sohmV1;
  });
  const fsohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fsohm;
  });
  const fgohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fgohm;
  });
  const fgOHMAsfsOHMBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fgOHMAsfsOHM;
  });
  const wsohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.wsohm;
  });
  const fiatDaowsohmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.fiatDaowsohm;
  });
  const calculateWrappedAsSohm = (balance: string) => {
    return Number(balance) * Number(currentIndex);
  };
  const fiatDaoAsSohm = calculateWrappedAsSohm(fiatDaowsohmBalance);
  const gOhmBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.gohm;
  });
  const gOhmAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmAsSohmBal;
  });

  const gOhmOnArbitrum = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnArbitrum;
  });
  const gOhmOnArbAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnArbAsSohm;
  });

  const gOhmOnAvax = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnAvax;
  });
  const gOhmOnAvaxAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnAvaxAsSohm;
  });

  const gOhmOnPolygon = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnPolygon;
  });
  const gOhmOnPolygonAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnPolygonAsSohm;
  });

  const gOhmOnFantom = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnFantom;
  });
  const gOhmOnFantomAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnFantomAsSohm;
  });

  const gOhmOnTokemak = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnTokemak;
  });
  const gOhmOnTokemakAsSohm = useAppSelector(state => {
    return state.account.balances && state.account.balances.gOhmOnTokemakAsSohm;
  });

  const wsohmAsSohm = calculateWrappedAsSohm(wsohmBalance);

  const stakeAllowance = useAppSelector(state => {
    return (state.account.staking && state.account.staking.ohmStake) || 0;
  });
  const unstakeAllowance = useAppSelector(state => {
    return (state.account.staking && state.account.staking.ohmUnstake) || 0;
  });

  const directUnstakeAllowance = useAppSelector(state => {
    return (state.account.wrapping && state.account.wrapping.gOhmUnwrap) || 0;
  });

  const stakingRebase = useAppSelector(state => {
    return state.app.stakingRebase || 0;
  });
  const stakingAPY = useAppSelector(state => {
    return state.app.stakingAPY || 0;
  });
  const stakingTVL = useAppSelector(state => {
    return state.app.stakingTVL || 0;
  });

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(ohmBalance);
    } else if (!confirmation) {
      setQuantity(sohmBalance);
    } else if (confirmation) {
      setQuantity(gOhmAsSohm.toString());
    }
  };

  const onSeekApproval = async (token: string) => {
    if (token === "gohm") {
      await dispatch(changeGohmApproval({ address, token: token.toLowerCase(), provider, networkID: networkId }));
    } else {
      await dispatch(changeApproval({ address, token, provider, networkID: networkId, version2: true }));
    }
  };

  const onChangeStake = async (action: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(quantity)) || Number(quantity) === 0 || Number(quantity) < 0) {
      // eslint-disable-next-line no-alert
      return dispatch(error(t`Please enter a value!`));
    }

    // 1st catch if quantity > balance
    const gweiValue = ethers.utils.parseUnits(quantity.toString(), "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
      return dispatch(error(t`You cannot stake more than your OHM balance.`));
    }

    if (confirmation === false && action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(sohmBalance, "gwei"))) {
      return dispatch(
        error(
          t`You do not have enough sORCL to complete this transaction.  To unstake from gORCL, please toggle the sorcl-gorcl switch.`,
        ),
      );
    }

    /**
     * converts sOHM quantity to gOHM quantity when box is checked for gOHM staking
     * @returns sOHM as gOHM quantity
     */
    // const formQuant = checked && currentIndex && view === 1 ? quantity / Number(currentIndex) : quantity;
    const formQuant = async () => {
      if (confirmation && currentIndex && view === 1) {
        return await getGohmBalFromSohm({ provider, networkID: networkId, sOHMbalance: quantity });
      } else {
        return quantity;
      }
    };

    await dispatch(
      changeStake({
        address,
        action,
        value: await formQuant(),
        provider,
        networkID: networkId,
        version2: true,
        rebase: !confirmation,
      }),
    );
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "ohm") return stakeAllowance > 0;
      if (token === "sohm") return unstakeAllowance > 0;
      if (token === "gohm") return directUnstakeAllowance > 0;
      return 0;
    },
    [stakeAllowance, unstakeAllowance, directUnstakeAllowance],
  );

  const isAllowanceDataLoading = (stakeAllowance == null && view === 0) || (unstakeAllowance == null && view === 1);

  const changeView: any = (_event: ChangeEvent<any>, newView: number) => {
    setView(newView);
  };

  const handleChangeQuantity = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
    if (Number(e.target.value) >= 0) setQuantity(e.target.value);
  }, []);

  const trimmedBalance = Number(
    [
      sohmBalance,
      gOhmAsSohm,
      gOhmOnArbAsSohm,
      gOhmOnAvaxAsSohm,
      gOhmOnPolygonAsSohm,
      gOhmOnFantomAsSohm,
      gOhmOnTokemakAsSohm,
      sohmV1Balance,
      wsohmAsSohm,
      fiatDaoAsSohm,
      fsohmBalance,
      fgOHMAsfsOHMBalance,
    ]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);

  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const nextRewardValue = trim((Number(stakingRebasePercentage) / 100) * trimmedBalance, 4);

  const formattedTrimmedStakingAPY = new Intl.NumberFormat("en-US").format(Number(trimmedStakingAPY));
  const formattedStakingTVL = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(stakingTVL);
  const formattedCurrentIndex = trim(Number(currentIndex), 1);

  let stakeOnClick: () => Promise<{ payload: string; type: string } | undefined | void>;
  let stakeDisabled: boolean;
  let stakeButtonText: string;

  //set defaults. if unstake tab selected else use staking tab as default
  if (view === 1) {
    stakeDisabled = isPendingTxn(pendingTransactions, "approve_unstaking");
    stakeOnClick = () => onSeekApproval(confirmation ? "gohm" : "sohm");
    stakeButtonText = txnButtonText(pendingTransactions, "approve_unstaking", t`Approve`);
  } else {
    stakeDisabled = isPendingTxn(pendingTransactions, "approve_staking");
    stakeOnClick = () => onSeekApproval("ohm");
    stakeButtonText = txnButtonText(pendingTransactions, "approve_staking", t`Approve`);
  }

  //evaluate if data allowance data is finished loading
  if (!isAllowanceDataLoading) {
    //If Staking Tab
    if (view === 0) {
      if (address && hasAllowance("ohm")) {
        stakeDisabled = isPendingTxn(pendingTransactions, "staking");
        stakeOnClick = () => onChangeStake("stake");
        stakeButtonText = txnButtonText(
          pendingTransactions,
          "staking",
          `${t`Stake to`} ${confirmation ? " gOHM" : " sOHM"}`,
        );
      }
    }
    //If Unstaking Tab
    if (view === 1) {
      if ((address && hasAllowance("sohm") && !confirmation) || (hasAllowance("gohm") && confirmation)) {
        stakeDisabled = isPendingTxn(pendingTransactions, "unstaking");
        stakeOnClick = () => onChangeStake("unstake");
        stakeButtonText = txnButtonText(
          pendingTransactions,
          "unstaking",
          `${t`Unstake from`} ${confirmation ? " gOHM" : " sOHM"}`,
        );
      }
    }
  }

  return (
    <div id="stake-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper headerText={t`Oracle DAO ICO`} subHeader={<RebaseTimer />}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <MetricCollection>
                <Metric
                  className="stake-apy"
                  label={t`Price per ORCL`}
                  metric={`${formattedTrimmedStakingAPY}%`}
                  isLoading={stakingAPY ? false : true}
                />
                <Metric
                  className="stake-tvl"
                  label={t`Total ORCL Bought`}
                  metric={formattedStakingTVL}
                  isLoading={stakingTVL ? false : true}
                />
                <Metric
                  className="stake-index"
                  label={t`ORCL Balance`}
                  metric={`${formattedCurrentIndex} sOHM`}
                  isLoading={currentIndex ? false : true}
                />
              </MetricCollection>
            </Grid>
            <div className="staking-area">
              {!address ? (
                <div className="stake-wallet-notification">
                  <div className="wallet-menu" id="wallet-menu">
                    <ConnectButton />
                  </div>
                  <Typography variant="h6">
                    <Trans>Connect your wallet to stake ORCL</Trans>
                  </Typography>
                </div>
              ) : (
                <>
                  <Box className="stake-action-area">
                    <Grid container className="stake-action-row">
                      <Input
                        id="amount-to-invest"
                        label="BUSD TO INVEST"
                        className="ohm-input"
                        value={quantity}
                        onChange={handleChangeQuantity}
                        labelWidth={0}
                        endString={t`BUSD`}
                      />
                      <Input
                        id="orcl-to-recieve"
                        label="ORCL YOU WILL RECIEVE"
                        className="ohm-input"
                        onChange={handleChangeQuantity}
                        labelWidth={0}
                        endString={t`ORCL`}
                      />
                      {address && !isAllowanceDataLoading ? (
                        <PrimaryButton style={{ width: "100%" }}>Buy Coin</PrimaryButton>
                      ) : (
                        <PrimaryButton />
                      )}
                    </Grid>
                  </Box>
                  <ConfirmDialog
                    quantity={quantity}
                    currentIndex={currentIndex}
                    view={view}
                    onConfirm={setConfirmation}
                  />
                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
    </div>
  );
};

export default memo(Ico);
