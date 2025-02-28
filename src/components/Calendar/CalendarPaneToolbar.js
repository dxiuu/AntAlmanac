import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Paper, Button, useMediaQuery, Menu } from '@material-ui/core';
import { Delete, Undo, MoreHoriz } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { clearSchedules, undoDelete } from '../../actions/AppStoreActions';
import CustomEventsDialog from '../CustomEvents/CustomEventDialog';
import { changeCurrentSchedule } from '../../actions/AppStoreActions';
import ScreenshotButton from './ScreenshotButton';
import ExportCalendar from './ExportCalendar';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ReactGA from 'react-ga';
import ConditionalWrapper from '../App/ConditionalWrapper';
import analyticsEnum, { logAnalytics } from '../../analytics';

const styles = {
    toolbar: {
        display: 'flex',
        overflow: 'hidden',
        marginBottom: '4px',
        alignItems: 'center',
        height: '50px',

        '& button': {
            margin: '0 2px 0 2px',
        },
        '& #finalButton': {
            marginLeft: '12px',
        },
        padding: '2px',
    },
    inline: {
        display: 'inline',
    },
    spacer: {
        flexGrow: '1',
    },
    scheduleSelector: {
        marginLeft: '10px',
    },
};

const CalendarPaneToolbar = (props) => {
    const { classes } = props;

    const handleScheduleChange = (event) => {
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CHANGE_SCHEDULE,
        });
        changeCurrentSchedule(event.target.value);
    };

    const isMobileScreen = useMediaQuery('(max-width:630px)');

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Paper elevation={0} variant="outlined" square className={classes.toolbar}>
            <Select
                className={classes.scheduleSelector}
                value={props.currentScheduleIndex}
                onChange={handleScheduleChange}
            >
                <MenuItem value={0}>Schedule 1</MenuItem>
                <MenuItem value={1}>Schedule 2</MenuItem>
                <MenuItem value={2}>Schedule 3</MenuItem>
                <MenuItem value={3}>Schedule 4</MenuItem>
            </Select>

            <Tooltip title="Toggle showing finals schedule">
                <Button
                    id="finalButton"
                    variant={props.showFinalsSchedule ? 'contained' : 'outlined'}
                    onClick={() => {
                        logAnalytics({
                            category: analyticsEnum.calendar.title,
                            action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
                        });
                        props.toggleDisplayFinalsSchedule();
                    }}
                    size="small"
                    color={props.showFinalsSchedule ? 'primary' : 'default'}
                >
                    Finals
                </Button>
            </Tooltip>

            <div className={classes.spacer} />

            <Tooltip title="Undo last deleted course">
                <IconButton
                    onClick={() => {
                        logAnalytics({
                            category: analyticsEnum.calendar.title,
                            label: analyticsEnum.calendar.actions.UNDO,
                        });
                        undoDelete(null);
                    }}
                >
                    <Undo fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title="Clear schedule">
                <IconButton
                    onClick={() => {
                        if (
                            window.confirm(
                                'Are you sure you want to clear this schedule? You cannot undo this action, but you can load your schedule again.'
                            )
                        ) {
                            clearSchedules([props.currentScheduleIndex]);
                            ReactGA.event({
                                category: 'antalmanac-rewrite',
                                action: 'Click Clear button',
                                label: 'Calendar Pane Toolbar',
                            });
                            logAnalytics({
                                category: analyticsEnum.calendar.title,
                                action: analyticsEnum.calendar.actions.CLEAR_SCHEDULE,
                            });
                        }
                    }}
                >
                    <Delete fontSize="small" />
                </IconButton>
            </Tooltip>

            <ConditionalWrapper
                condition={isMobileScreen}
                wrapper={(children) => (
                    <div>
                        <IconButton onClick={handleMenuClick}>
                            <MoreHoriz />
                        </IconButton>

                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            {children}
                        </Menu>
                    </div>
                )}
            >
                {[
                    <ExportCalendar />,
                    <ScreenshotButton
                        onTakeScreenshot={(handleClick) => {
                            logAnalytics({
                                category: analyticsEnum.calendar.title,
                                action: analyticsEnum.calendar.actions.SCREENSHOT,
                            });
                            props.onTakeScreenshot(handleClick);
                        }}
                    />,
                    <CustomEventsDialog editMode={false} currentScheduleIndex={props.currentScheduleIndex} />,
                ].map((element, index) => (
                    <ConditionalWrapper
                        key={index}
                        condition={isMobileScreen}
                        wrapper={(children) => <MenuItem onClick={handleMenuClose}>{children}</MenuItem>}
                    >
                        {element}
                    </ConditionalWrapper>
                ))}
            </ConditionalWrapper>
        </Paper>
    );
};

CalendarPaneToolbar.propTypes = {
    showFinalsSchedule: PropTypes.bool.isRequired,
    currentScheduleIndex: PropTypes.number.isRequired,
};

export default withStyles(styles)(CalendarPaneToolbar);
