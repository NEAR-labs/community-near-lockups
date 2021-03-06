import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import React, {useEffect, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {
  accountToLockup,
  epochToHumanReadable,
  timestampToReadable,
  viewLookupNew,
  yoktoToNear,
  convertDuration
} from "../utils/funcs";
import PropTypes from "prop-types";
import getConfig from "../config";
import Decimal from "decimal.js";

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

function addDays(date, days) {
  const copy = new Date(Number(date))
  copy.setDate(date.getDate() + days)
  return copy
}

export default function LockupData(props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const {lockup, onClose} = props;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [error, setError] = useState(false);


  useEffect(() => {
    viewLookupNew(lockup).then((r) => {
      setView(r);
      console.log(r);
      setOpen(true);
    }).catch((e) => {
      console.log(e);
      setOpen(true);
      setError(true)
    })
  }, [lockup]);


  return (
    <div>
      {open && view ?
        <Dialog
          onClose={onClose}
          fullScreen={fullScreen}
          open={open}
          aria-labelledby="lockup-data"
        >
          <DialogTitle style={{wordBreak: "break-word"}} id="lockup-data">
            {view.owner} - Ⓝ{view.ownerAccountBalance}
          </DialogTitle>
          <DialogContent>
            <DialogContentText className="black-text">
              <div
                style={{wordBreak: "break-word"}}>lockup: <b>{accountToLockup(nearConfig.lockupAccount, view.owner)}</b>
              </div>
              <div>total amount (owner + lockup): <b>Ⓝ {view.totalAmount}</b></div>
              <div>lockup amount: <b>Ⓝ {yoktoToNear(view.lockupAmount)}</b></div>
              <div>lockup release duration: <b>{view.releaseDuration ? timestampToReadable(new Decimal(view.releaseDuration).mul(1000000000 * 60 * 60 * 24).toString()) : 0}</b></div>
              <div>lockup release start date: <b>{view.lockupReleaseStartDate.toDateString()}</b></div>
              <div>liquid amount: <b>Ⓝ {view.liquidAmount}</b></div>
              <div>
                vesting schedule: {view.vestingInformation ?
                <>
                  <ul>
                    <li style={{wordBreak: "break-word"}}>Vesting Start Date: {convertDuration(view.vestingInformation.start).toDateString()}</li>
                    <li style={{wordBreak: "break-word"}}>Vesting Cliff Date: {convertDuration(view.vestingInformation.cliff).toDateString()}</li>
                    <li style={{wordBreak: "break-word"}}>Vesting End Date: {convertDuration(view.vestingInformation.end).toDateString()}</li>
                  </ul>
                </>
                : "no"
              }
              </div>

            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        : null
      }

      {open && error ?
        <Dialog
          onClose={onClose}
          fullScreen={fullScreen}
          open={open}
          aria-labelledby="lockup-data"
        >
          <DialogTitle style={{wordBreak: "break-word"}} id="lockup-data">
            <span style={{color: 'red'}}>Error</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText className="black-text">
              No lockup for account <b>{lockup}</b> found, or error occurred!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        : null
      }
    </div>
  )
}

LockupData.propTypes = {
  lockup: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
